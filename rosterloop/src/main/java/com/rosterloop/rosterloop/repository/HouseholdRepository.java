package com.rosterloop.rosterloop.repository;

import com.rosterloop.rosterloop.entity.Household;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HouseholdRepository extends JpaRepository<Household, UUID> {
    Optional<Household> findById(UUID id);
}
