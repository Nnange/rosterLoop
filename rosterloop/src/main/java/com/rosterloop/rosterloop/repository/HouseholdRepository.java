package com.rosterloop.rosterloop.repository;

import com.rosterloop.rosterloop.entity.Household;
import com.rosterloop.rosterloop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HouseholdRepository extends JpaRepository<Household, UUID> {
    Optional<Household> findById(UUID id);
    List<Household> findByOwner(User owner);
    Optional<Household> findByJoinToken(String joinToken);
    List<Household> findByOwnerId(UUID ownerId);  // ✅ NEW: Find by owner ID
}
