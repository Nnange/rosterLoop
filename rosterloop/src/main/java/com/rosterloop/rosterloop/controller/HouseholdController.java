package com.rosterloop.rosterloop.controller;

import com.rosterloop.rosterloop.entity.Household;
import com.rosterloop.rosterloop.entity.HouseholdMember;
import com.rosterloop.rosterloop.entity.User;
import com.rosterloop.rosterloop.repository.HouseholdMemberRepository;
import com.rosterloop.rosterloop.repository.HouseholdRepository;
import com.rosterloop.rosterloop.repository.HouseholdInvitationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RestController
@RequestMapping("/rosterloop/api/households")
public class HouseholdController {
    private static final Logger logger = LoggerFactory.getLogger(HouseholdController.class);
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final HouseholdInvitationRepository householdInvitationRepository;

    public HouseholdController(HouseholdRepository householdRepository, 
                            HouseholdMemberRepository householdMemberRepository,
                            HouseholdInvitationRepository householdInvitationRepository) {
        this.householdRepository = householdRepository;
        this.householdMemberRepository = householdMemberRepository;
        this.householdInvitationRepository = householdInvitationRepository;
    }

    @GetMapping("/member/status")
    public ResponseEntity<MemberStatusResponse> checkMemberStatus(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            User user = (User) authentication.getPrincipal();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            // Check if user has any member households
            List<HouseholdMember> members = householdMemberRepository.findByUserId(user.getId());
            boolean isMember = !members.isEmpty();
            return ResponseEntity.ok(new MemberStatusResponse(isMember));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<Household> createHousehold(@RequestBody Household household, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            User owner = (User) authentication.getPrincipal();
            
            // Only ROLE_ADMIN can create households
            if (!owner.getRole().equals("ROLE_ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            household.setOwner(owner);
            household.setCreatedAt(LocalDateTime.now());
            
            Household savedHousehold = householdRepository.save(household);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedHousehold);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Household> getHouseholdById(@PathVariable UUID id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Household household = householdRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Household not found"));
            
            User user = (User) authentication.getPrincipal();
            
            // Check if user is the owner
            boolean isOwner = household.getOwner().getId().equals(user.getId());
            
            // Check if user is a member
            boolean isMember = householdMemberRepository.existsByHouseholdIdAndUserId(id, user.getId());
            
            if (!isOwner && !isMember) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(household);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Household>> getHouseholdsByOwner(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            User user = (User) authentication.getPrincipal();
            
            // Get households owned by the user
            List<Household> ownedHouseholds = householdRepository.findByOwner(user);
            
            // Get households where user is a member
            List<HouseholdMember> memberHouseholds = householdMemberRepository.findByUserId(user.getId());
            List<Household> memberHouseholdsList = memberHouseholds.stream()
                    .map(HouseholdMember::getHousehold)
                    .toList();
            
            // Combine both lists and remove duplicates
            List<Household> allHouseholds = new java.util.ArrayList<>(ownedHouseholds);
            for (Household household : memberHouseholdsList) {
                if (!allHouseholds.contains(household)) {
                    allHouseholds.add(household);
                }
            }
            
            return ResponseEntity.ok(allHouseholds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Household> updateHousehold(@PathVariable UUID id, @RequestBody Household updatedHousehold, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Household household = householdRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Household not found"));
            
            User owner = (User) authentication.getPrincipal();
            if (!household.getOwner().getId().equals(owner.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Update fields
            if (updatedHousehold.getHouseholdName() != null) {
                household.setHouseholdName(updatedHousehold.getHouseholdName());
            }
            if (updatedHousehold.getFlatmateNames() != null) {
                household.setFlatmateNames(updatedHousehold.getFlatmateNames());
            }

            Household savedHousehold = householdRepository.save(household);
            return ResponseEntity.ok(savedHousehold);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DeleteHouseholdResponse> deleteHousehold(@PathVariable UUID id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Household household = householdRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Household not found"));
            
            User owner = (User) authentication.getPrincipal();
            if (!household.getOwner().getId().equals(owner.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Check if household has members and delete them first
            List<HouseholdMember> members = householdMemberRepository.findByHouseholdId(id);
            logger.info("Found {} members in household {}", members.size(), id);
            
            if (!members.isEmpty()) {
                householdMemberRepository.deleteAll(members);
                logger.info("Successfully deleted {} members from household {}", members.size(), id);
            }

            // Delete any invitations related to this household
            var invitations = householdInvitationRepository.findByHouseholdId(id);
            if (!invitations.isEmpty()) {
                householdInvitationRepository.deleteAll(invitations);
                logger.info("Successfully deleted {} invitations from household {}", invitations.size(), id);
            }

            // Now delete the household
            householdRepository.delete(household);
            logger.info("Successfully deleted household {}", id);
            
            return ResponseEntity.ok(new DeleteHouseholdResponse(true, "Household deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting household: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new DeleteHouseholdResponse(false, "Error deleting household: " + e.getMessage()));
        }
    }

    public static class MemberStatusResponse {
        private final boolean hasMembership;

        public MemberStatusResponse(boolean hasMembership) {
            this.hasMembership = hasMembership;
        }

        public boolean isHasMembership() {
            return hasMembership;
        }
    }

    public static class DeleteHouseholdResponse {
        private final boolean success;
        private final String message;

        public DeleteHouseholdResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }
    }
}
