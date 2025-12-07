package com.rosterloop.rosterloop.controller;

import com.rosterloop.rosterloop.entity.Household;
import com.rosterloop.rosterloop.repository.HouseholdRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/rosterloop/api")
public class HouseholdController {
    private final HouseholdRepository householdRepository;

    public HouseholdController(HouseholdRepository householdRepository) {
        this.householdRepository = householdRepository;
    }

    @PostMapping
    public ResponseEntity<String> createHousehold(@RequestBody Household household) {

        household.setCreatedAt(LocalDateTime.now());
        householdRepository.save(household);

        return ResponseEntity.ok("Created household");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Household> getHouseholdById(@PathVariable UUID id) {
        Household household = householdRepository.findById(id).orElse(null);
        return ResponseEntity.ok(household);
    }
}
