package com.rosterloop.rosterloop.service;

import com.rosterloop.rosterloop.dto.HouseholdInvitationResponse;
import com.rosterloop.rosterloop.entity.Household;
import com.rosterloop.rosterloop.entity.HouseholdInvitation;
import com.rosterloop.rosterloop.entity.HouseholdMember;
import com.rosterloop.rosterloop.entity.User;
import com.rosterloop.rosterloop.exception.InvitationException;
import com.rosterloop.rosterloop.repository.HouseholdInvitationRepository;
import com.rosterloop.rosterloop.repository.HouseholdMemberRepository;
import com.rosterloop.rosterloop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class HouseholdInvitationService {
    private final HouseholdInvitationRepository invitationRepository;
    private final HouseholdMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public HouseholdInvitationService(HouseholdInvitationRepository invitationRepository,
                                      HouseholdMemberRepository memberRepository,
                                      UserRepository userRepository,
                                      EmailService emailService) {
        this.invitationRepository = invitationRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public HouseholdInvitation createInvitation(Household household, User inviter, String inviteeEmail) {
        // Invitations expire in 30 days
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(30);
        
        HouseholdInvitation invitation = new HouseholdInvitation(
            UUID.randomUUID(),
            household,
            inviter,
            inviteeEmail.toLowerCase(),
            expiresAt
        );
        
        HouseholdInvitation savedInvitation = invitationRepository.save(invitation);
        
        // Send invitation email
        String invitationLink = frontendUrl + "/invitations";
        String inviterName = inviter.getFirstName() + " " + inviter.getLastName();
        emailService.sendInvitationEmail(inviteeEmail, household.getHouseholdName(), inviterName, invitationLink);
        
        return savedInvitation;
    }

    @Transactional
    public void acceptInvitation(UUID invitationId, User user) {
        Optional<HouseholdInvitation> invitationOpt = invitationRepository.findById(invitationId);
        
        if (invitationOpt.isEmpty()) {
            throw new InvitationException("Invitation not found");
        }
        
        HouseholdInvitation invitation = invitationOpt.get();
        
        // Verify invitation hasn't expired
        if (LocalDateTime.now().isAfter(invitation.getExpiresAt())) {
            invitation.setStatus("EXPIRED");
            invitationRepository.save(invitation);
            throw new InvitationException("Invitation has expired");
        }
        
        // Verify invitation email matches user email
        if (!invitation.getInviteeEmail().equalsIgnoreCase(user.getEmail())) {
            throw new InvitationException("Invitation email does not match user email");
        }
        
        // Verify user is not already a member
        if (memberRepository.existsByHouseholdIdAndUserId(invitation.getHousehold().getId(), user.getId())) {
            throw new InvitationException("User is already a member of this household");
        }
        
        // Add user as member
        HouseholdMember member = new HouseholdMember(
            UUID.randomUUID(),
            invitation.getHousehold(),
            user,
            LocalDateTime.now()
        );
        memberRepository.save(member);
        
        // Update invitation status
        invitation.setStatus("ACCEPTED");
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    @Transactional
    public void declineInvitation(UUID invitationId, User user) {
        Optional<HouseholdInvitation> invitationOpt = invitationRepository.findById(invitationId);
        
        if (invitationOpt.isEmpty()) {
            throw new InvitationException("Invitation not found");
        }
        
        HouseholdInvitation invitation = invitationOpt.get();
        
        // Verify invitation email matches user email
        if (!invitation.getInviteeEmail().equalsIgnoreCase(user.getEmail())) {
            throw new InvitationException("Invitation email does not match user email");
        }
        
        invitation.setStatus("DECLINED");
        invitation.setDeclinedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    public List<HouseholdInvitationResponse> getPendingInvitations(String userEmail) {
        List<HouseholdInvitation> invitations = invitationRepository.findByInviteeEmailAndStatus(userEmail.toLowerCase(), "PENDING");
        
        return invitations.stream()
            .filter(inv -> LocalDateTime.now().isBefore(inv.getExpiresAt()))
            .map(inv -> new HouseholdInvitationResponse(
                inv.getId(),
                inv.getHousehold().getHouseholdName(),
                inv.getInviter() != null ? inv.getInviter().getFirstName() + " " + inv.getInviter().getLastName() : "Unknown",
                inv.getStatus(),
                inv.getInvitedAt(),
                inv.getExpiresAt()
            ))
            .toList();
    }

    public List<HouseholdMember> getHouseholdMembers(UUID householdId) {
        return memberRepository.findByHouseholdId(householdId);
    }

    public boolean isHouseholdMember(UUID householdId, UUID userId) {
        return memberRepository.existsByHouseholdIdAndUserId(householdId, userId);
    }

    public List<com.rosterloop.rosterloop.dto.HouseholdMemberResponse> getHouseholdMembersWithStatus(UUID householdId) {
        List<com.rosterloop.rosterloop.dto.HouseholdMemberResponse> responses = new java.util.ArrayList<>();
        
        // Get all members (accepted invitations)
        List<HouseholdMember> members = memberRepository.findByHouseholdId(householdId);
        for (HouseholdMember member : members) {
            User user = member.getUser();
            // Skip if user is null (deleted user - shouldn't happen with cascade delete, but safe guard)
            if (user == null || !user.getIsActive()) {
                continue;
            }
            com.rosterloop.rosterloop.dto.HouseholdMemberResponse response = new com.rosterloop.rosterloop.dto.HouseholdMemberResponse(
                member.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                "MEMBER"
            );
            response.setDisplayName(member.getDisplayName());
            responses.add(response);
        }
        
        // Get all pending invitations
        List<HouseholdInvitation> pendingInvitations = invitationRepository.findByHouseholdIdAndStatus(householdId, "PENDING");
        for (HouseholdInvitation invitation : pendingInvitations) {
            // Don't show if expired
            if (LocalDateTime.now().isBefore(invitation.getExpiresAt())) {
                // Check if the invitee is an existing user and if so, skip deleted/inactive users
                Optional<User> inviteeUser = userRepository.findByEmail(invitation.getInviteeEmail());
                if (inviteeUser.isPresent() && !inviteeUser.get().getIsActive()) {
                    // Skip this invitation if the user was deleted or is inactive
                    continue;
                }
                
                responses.add(new com.rosterloop.rosterloop.dto.HouseholdMemberResponse(
                    invitation.getId().toString(),
                    invitation.getInviteeEmail(),
                    "", // No first/last name for pending invitations
                    "",
                    "PENDING"
                ));
            }
        }
        
        return responses;
    }

    @Transactional
    public void removeMember(UUID householdId, UUID memberId) {
        Optional<HouseholdMember> memberOpt = memberRepository.findById(memberId);
        
        if (memberOpt.isEmpty()) {
            throw new InvitationException("Member not found");
        }
        
        HouseholdMember member = memberOpt.get();
        
        // Verify member belongs to this household
        if (!member.getHousehold().getId().equals(householdId)) {
            throw new InvitationException("Member does not belong to this household");
        }
        
        memberRepository.delete(member);
    }

    @Transactional
    public void updateMemberDisplayName(UUID householdId, UUID memberId, String displayName) {
        Optional<HouseholdMember> memberOpt = memberRepository.findById(memberId);
        
        if (memberOpt.isEmpty()) {
            throw new InvitationException("Member not found");
        }
        
        HouseholdMember member = memberOpt.get();
        
        // Verify member belongs to this household
        if (!member.getHousehold().getId().equals(householdId)) {
            throw new InvitationException("Member does not belong to this household");
        }
        
        member.setDisplayName(displayName);
        memberRepository.save(member);
    }
}
