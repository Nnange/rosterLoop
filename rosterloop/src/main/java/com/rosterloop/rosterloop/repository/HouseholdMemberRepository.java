package com.rosterloop.rosterloop.repository;

import com.rosterloop.rosterloop.entity.HouseholdMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HouseholdMemberRepository extends JpaRepository<HouseholdMember, UUID> {
    List<HouseholdMember> findByHouseholdId(UUID householdId);
    List<HouseholdMember> findByUserId(UUID userId);
    Optional<HouseholdMember> findByHouseholdIdAndUserId(UUID householdId, UUID userId);
    boolean existsByHouseholdIdAndUserId(UUID householdId, UUID userId);
}
