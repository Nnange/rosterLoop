package com.rosterloop.rosterloop.controller;

import com.rosterloop.rosterloop.entity.Household;
import com.rosterloop.rosterloop.entity.User;
import com.rosterloop.rosterloop.repository.HouseholdRepository;
import com.rosterloop.rosterloop.service.AuthService;
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
    private final HouseholdRepository householdRepository;

    public HouseholdController(HouseholdRepository householdRepository) {
        this.householdRepository = householdRepository;
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
            
            User owner = (User) authentication.getPrincipal();
            if (!household.getOwner().getId().equals(owner.getId())) {
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
            User owner = (User) authentication.getPrincipal();
            List<Household> households = householdRepository.findByOwner(owner);
            return ResponseEntity.ok(households);
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
    public ResponseEntity<Void> deleteHousehold(@PathVariable UUID id, Authentication authentication) {
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

            householdRepository.delete(household);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
