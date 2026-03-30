package com.rosterloop.rosterloop.controller;

import com.rosterloop.rosterloop.dto.HouseholdInvitationResponse;
import com.rosterloop.rosterloop.dto.InvitationRequest;
import com.rosterloop.rosterloop.entity.Household;
import com.rosterloop.rosterloop.entity.User;
import com.rosterloop.rosterloop.exception.InvitationException;
import com.rosterloop.rosterloop.repository.HouseholdRepository;
import com.rosterloop.rosterloop.repository.UserRepository;
import com.rosterloop.rosterloop.service.HouseholdInvitationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/rosterloop/api/invitations")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.178.36:3002", "https://rosterloop.awongnnange.com"})
public class InvitationController {
    private final HouseholdInvitationService invitationService;
    private final HouseholdRepository householdRepository;
    private final UserRepository userRepository;

    public InvitationController(HouseholdInvitationService invitationService,
                                HouseholdRepository householdRepository,
                                UserRepository userRepository) {
        this.invitationService = invitationService;
        this.householdRepository = householdRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/households/{householdId}/invite")
    public ResponseEntity<Object> inviteToHousehold(@PathVariable UUID householdId,
                                                    @RequestBody InvitationRequest request,
                                                    Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("User not found"));
            }
            
            User user = userOpt.get();
            Optional<Household> householdOpt = householdRepository.findById(householdId);
            
            if (householdOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Household not found"));
            }
            
            Household household = householdOpt.get();
            
            // Verify user is the household owner
            if (!household.getOwner().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("Only household owner can invite members"));
            }
            
            invitationService.createInvitation(household, user, request.getInviteeEmail());
            return ResponseEntity.ok(new ErrorResponse("Invitation sent successfully"));
            
        } catch (InvitationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to send invitation"));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<Object> getPendingInvitations(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<HouseholdInvitationResponse> invitations = invitationService.getPendingInvitations(userEmail);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to fetch invitations"));
        }
    }

    @PostMapping("/{invitationId}/accept")
    public ResponseEntity<Object> acceptInvitation(@PathVariable UUID invitationId,
                                                   Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("User not found"));
            }
            
            invitationService.acceptInvitation(invitationId, userOpt.get());
            return ResponseEntity.ok(new ErrorResponse("Invitation accepted successfully"));
            
        } catch (InvitationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to accept invitation"));
        }
    }

    @PostMapping("/{invitationId}/decline")
    public ResponseEntity<Object> declineInvitation(@PathVariable UUID invitationId,
                                                    Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("User not found"));
            }
            
            invitationService.declineInvitation(invitationId, userOpt.get());
            return ResponseEntity.ok(new ErrorResponse("Invitation declined successfully"));
            
        } catch (InvitationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to decline invitation"));
        }
    }

    @GetMapping("/households/{householdId}/members")
    public ResponseEntity<Object> getHouseholdMembers(@PathVariable UUID householdId,
                                                      Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("User not found"));
            }
            
            User user = userOpt.get();
            Optional<Household> householdOpt = householdRepository.findById(householdId);
            
            if (householdOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Household not found"));
            }
            
            Household household = householdOpt.get();
            
            // Verify user is the household owner
            if (!household.getOwner().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("Only household owner can view members"));
            }
            
            java.util.List<com.rosterloop.rosterloop.dto.HouseholdMemberResponse> members = invitationService.getHouseholdMembersWithStatus(householdId);
            return ResponseEntity.ok(members);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to fetch members"));
        }
    }

    @DeleteMapping("/households/{householdId}/members/{memberId}")
    public ResponseEntity<Object> removeMember(@PathVariable UUID householdId,
                                               @PathVariable UUID memberId,
                                               Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("User not found"));
            }
            
            User user = userOpt.get();
            Optional<Household> householdOpt = householdRepository.findById(householdId);
            
            if (householdOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Household not found"));
            }
            
            Household household = householdOpt.get();
            
            // Verify user is the household owner
            if (!household.getOwner().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("Only household owner can remove members"));
            }
            
            invitationService.removeMember(householdId, memberId);
            return ResponseEntity.ok(new ErrorResponse("Member removed successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to remove member: " + e.getMessage()));
        }
    }

    @PutMapping("/households/{householdId}/members/{memberId}/display-name")
    public ResponseEntity<Object> updateMemberDisplayName(@PathVariable UUID householdId,
                                                          @PathVariable UUID memberId,
                                                          @RequestBody com.rosterloop.rosterloop.dto.UpdateMemberDisplayNameRequest request,
                                                          Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("User not found"));
            }
            
            User user = userOpt.get();
            Optional<Household> householdOpt = householdRepository.findById(householdId);
            
            if (householdOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Household not found"));
            }
            
            Household household = householdOpt.get();
            
            // Verify user is the household owner
            if (!household.getOwner().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("Only household owner can update member display names"));
            }
            
            invitationService.updateMemberDisplayName(householdId, memberId, request.getDisplayName());
            return ResponseEntity.ok(new ErrorResponse("Display name updated successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to update display name: " + e.getMessage()));
        }
    }

    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
