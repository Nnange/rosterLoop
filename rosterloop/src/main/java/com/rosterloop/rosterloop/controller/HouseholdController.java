package com.rosterloop.rosterloop.controller;

import com.rosterloop.rosterloop.entity.Household;
import com.rosterloop.rosterloop.repository.HouseholdRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

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
}
