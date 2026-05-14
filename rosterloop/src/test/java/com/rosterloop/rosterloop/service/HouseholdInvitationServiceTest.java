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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HouseholdInvitationServiceTest {

    @Mock private HouseholdInvitationRepository invitationRepository;
    @Mock private HouseholdMemberRepository memberRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;

    private HouseholdInvitationService service;

    private User inviter;
    private User invitee;
    private Household household;

    @BeforeEach
    void setUp() {
        service = new HouseholdInvitationService(
                invitationRepository, memberRepository, userRepository, emailService);
        ReflectionTestUtils.setField(service, "frontendUrl", "http://localhost:3000");

        inviter = userWithEmail(UUID.randomUUID(), "alice@example.com", "Alice", "Smith");
        invitee = userWithEmail(UUID.randomUUID(), "bob@example.com",   "Bob",   "Jones");

        household = new Household();
        household.setId(UUID.randomUUID());
        household.setHouseholdName("Flat 4B");
        household.setOwner(inviter);
    }

    // ── createInvitation ──────────────────────────────────────────────────────

    @Test
    void createInvitation_savesAndReturnsInvitation() {
        when(invitationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        HouseholdInvitation result = service.createInvitation(household, inviter, "Bob@example.com");

        assertThat(result.getInviteeEmail()).isEqualTo("bob@example.com"); // lowercased
        assertThat(result.getStatus()).isEqualTo("PENDING");
        assertThat(result.getExpiresAt()).isAfter(LocalDateTime.now().plusDays(29));
    }

    @Test
    void createInvitation_sendsInvitationEmail() {
        when(invitationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.createInvitation(household, inviter, "bob@example.com");

        verify(emailService).sendInvitationEmail(
                eq("bob@example.com"), eq("Flat 4B"), eq("Alice Smith"), anyString());
    }

    // ── acceptInvitation ──────────────────────────────────────────────────────

    @Test
    void acceptInvitation_throwsWhenInvitationNotFound() {
        UUID id = UUID.randomUUID();
        when(invitationRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.acceptInvitation(id, invitee))
                .isInstanceOf(InvitationException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void acceptInvitation_throwsWhenExpired() {
        HouseholdInvitation invitation = pendingInvitation(invitee.getEmail(),
                LocalDateTime.now().minusMinutes(1));
        UUID id = invitation.getId();
        when(invitationRepository.findById(id)).thenReturn(Optional.of(invitation));
        when(invitationRepository.save(any())).thenReturn(invitation);

        assertThatThrownBy(() -> service.acceptInvitation(id, invitee))
                .isInstanceOf(InvitationException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void acceptInvitation_throwsWhenEmailMismatch() {
        HouseholdInvitation invitation = pendingInvitation("other@example.com",
                LocalDateTime.now().plusDays(1));
        UUID id = invitation.getId();
        when(invitationRepository.findById(id)).thenReturn(Optional.of(invitation));

        assertThatThrownBy(() -> service.acceptInvitation(id, invitee))
                .isInstanceOf(InvitationException.class)
                .hasMessageContaining("email does not match");
    }

    @Test
    void acceptInvitation_throwsWhenAlreadyMember() {
        HouseholdInvitation invitation = pendingInvitation(invitee.getEmail(),
                LocalDateTime.now().plusDays(1));
        UUID id = invitation.getId();
        when(invitationRepository.findById(id)).thenReturn(Optional.of(invitation));
        when(memberRepository.existsByHouseholdIdAndUserId(household.getId(), invitee.getId()))
                .thenReturn(true);

        assertThatThrownBy(() -> service.acceptInvitation(id, invitee))
                .isInstanceOf(InvitationException.class)
                .hasMessageContaining("already a member");
    }

    @Test
    void acceptInvitation_addsMemberAndUpdatesStatusOnSuccess() {
        HouseholdInvitation invitation = pendingInvitation(invitee.getEmail(),
                LocalDateTime.now().plusDays(1));
        UUID id = invitation.getId();
        when(invitationRepository.findById(id)).thenReturn(Optional.of(invitation));
        when(memberRepository.existsByHouseholdIdAndUserId(household.getId(), invitee.getId()))
                .thenReturn(false);
        when(memberRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(invitationRepository.save(any())).thenReturn(invitation);

        service.acceptInvitation(id, invitee);

        verify(memberRepository).save(any(HouseholdMember.class));
        assertThat(invitation.getStatus()).isEqualTo("ACCEPTED");
        assertThat(invitation.getAcceptedAt()).isNotNull();
    }

    // ── declineInvitation ─────────────────────────────────────────────────────

    @Test
    void declineInvitation_throwsWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(invitationRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.declineInvitation(id, invitee))
                .isInstanceOf(InvitationException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void declineInvitation_throwsWhenEmailMismatch() {
        HouseholdInvitation invitation = pendingInvitation("other@example.com",
                LocalDateTime.now().plusDays(1));
        UUID id = invitation.getId();
        when(invitationRepository.findById(id)).thenReturn(Optional.of(invitation));

        assertThatThrownBy(() -> service.declineInvitation(id, invitee))
                .isInstanceOf(InvitationException.class)
                .hasMessageContaining("email does not match");
    }

    @Test
    void declineInvitation_updatesStatusToDeclined() {
        HouseholdInvitation invitation = pendingInvitation(invitee.getEmail(),
                LocalDateTime.now().plusDays(1));
        UUID id = invitation.getId();
        when(invitationRepository.findById(id)).thenReturn(Optional.of(invitation));
        when(invitationRepository.save(any())).thenReturn(invitation);

        service.declineInvitation(id, invitee);

        assertThat(invitation.getStatus()).isEqualTo("DECLINED");
        assertThat(invitation.getDeclinedAt()).isNotNull();
    }

    // ── getPendingInvitations ─────────────────────────────────────────────────

    @Test
    void getPendingInvitations_filtersOutExpiredInvitations() {
        HouseholdInvitation valid   = pendingInvitation(invitee.getEmail(), LocalDateTime.now().plusDays(1));
        HouseholdInvitation expired = pendingInvitation(invitee.getEmail(), LocalDateTime.now().minusMinutes(1));
        when(invitationRepository.findByInviteeEmailAndStatus(invitee.getEmail(), "PENDING"))
                .thenReturn(List.of(valid, expired));

        List<HouseholdInvitationResponse> result =
                service.getPendingInvitations(invitee.getEmail());

        assertThat(result).hasSize(1);
    }

    @Test
    void getPendingInvitations_mapsToResponseDto() {
        HouseholdInvitation inv = pendingInvitation(invitee.getEmail(), LocalDateTime.now().plusDays(1));
        when(invitationRepository.findByInviteeEmailAndStatus(invitee.getEmail(), "PENDING"))
                .thenReturn(List.of(inv));

        List<HouseholdInvitationResponse> result =
                service.getPendingInvitations(invitee.getEmail());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getHouseholdName()).isEqualTo("Flat 4B");
        assertThat(result.get(0).getInviterName()).isEqualTo("Alice Smith");
        assertThat(result.get(0).getStatus()).isEqualTo("PENDING");
    }

    // ── removeMember ──────────────────────────────────────────────────────────

    @Test
    void removeMember_throwsWhenMemberNotFound() {
        UUID memberId = UUID.randomUUID();
        when(memberRepository.findById(memberId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.removeMember(household.getId(), memberId))
                .isInstanceOf(InvitationException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void removeMember_throwsWhenMemberBelongsToDifferentHousehold() {
        Household other = new Household();
        other.setId(UUID.randomUUID());

        HouseholdMember member = memberInHousehold(other);
        UUID memberId = member.getId();
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));

        assertThatThrownBy(() -> service.removeMember(household.getId(), memberId))
                .isInstanceOf(InvitationException.class)
                .hasMessageContaining("does not belong");
    }

    @Test
    void removeMember_deletesMemberOnSuccess() {
        HouseholdMember member = memberInHousehold(household);
        UUID memberId = member.getId();
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));

        service.removeMember(household.getId(), memberId);

        verify(memberRepository).delete(member);
    }

    // ── updateMemberDisplayName ───────────────────────────────────────────────

    @Test
    void updateMemberDisplayName_throwsWhenMemberNotFound() {
        UUID memberId = UUID.randomUUID();
        when(memberRepository.findById(memberId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateMemberDisplayName(household.getId(), memberId, "Bobby"))
                .isInstanceOf(InvitationException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void updateMemberDisplayName_updatesDisplayName() {
        HouseholdMember member = memberInHousehold(household);
        UUID memberId = member.getId();
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(memberRepository.save(any())).thenReturn(member);

        service.updateMemberDisplayName(household.getId(), memberId, "Bobby");

        ArgumentCaptor<HouseholdMember> captor = ArgumentCaptor.forClass(HouseholdMember.class);
        verify(memberRepository).save(captor.capture());
        assertThat(captor.getValue().getDisplayName()).isEqualTo("Bobby");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private static User userWithEmail(UUID id, String email, String firstName, String lastName) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setIsActive(true);
        return u;
    }

    private HouseholdInvitation pendingInvitation(String inviteeEmail, LocalDateTime expiresAt) {
        return new HouseholdInvitation(UUID.randomUUID(), household, inviter, inviteeEmail, expiresAt);
    }

    private static HouseholdMember memberInHousehold(Household h) {
        HouseholdMember m = new HouseholdMember();
        m.setId(UUID.randomUUID());
        m.setHousehold(h);
        m.setJoinedAt(LocalDateTime.now());
        return m;
    }
}
