package com.rosterloop.rosterloop.repository;

import com.rosterloop.rosterloop.entity.HouseholdInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HouseholdInvitationRepository extends JpaRepository<HouseholdInvitation, UUID> {
    List<HouseholdInvitation> findByHouseholdId(UUID householdId);
    List<HouseholdInvitation> findByInviterId(UUID inviterId);
    List<HouseholdInvitation> findByInviteeEmail(String inviteeEmail);
    List<HouseholdInvitation> findByInviteeEmailAndStatus(String inviteeEmail, String status);
    List<HouseholdInvitation> findByHouseholdIdAndStatus(UUID householdId, String status);
    Optional<HouseholdInvitation> findByIdAndInviteeEmail(UUID id, String inviteeEmail);
}
