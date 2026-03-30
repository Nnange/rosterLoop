package com.rosterloop.rosterloop.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class HouseholdInvitationResponse {
    private UUID id;
    private String householdName;
    private String inviterName;
    private String status;
    private LocalDateTime invitedAt;
    private LocalDateTime expiresAt;

    public HouseholdInvitationResponse() {}

    public HouseholdInvitationResponse(UUID id, String householdName, String inviterName, String status, LocalDateTime invitedAt, LocalDateTime expiresAt) {
        this.id = id;
        this.householdName = householdName;
        this.inviterName = inviterName;
        this.status = status;
        this.invitedAt = invitedAt;
        this.expiresAt = expiresAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getHouseholdName() {
        return householdName;
    }

    public void setHouseholdName(String householdName) {
        this.householdName = householdName;
    }

    public String getInviterName() {
        return inviterName;
    }

    public void setInviterName(String inviterName) {
        this.inviterName = inviterName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
