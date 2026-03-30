package com.rosterloop.rosterloop.dto;

import java.time.LocalDateTime;

/**
 * DTO for household member information with invitation status
 */
public class HouseholdMemberResponse {
    private String memberId;
    private String email;
    private String firstName;
    private String lastName;
    private String displayName;
    private String status; // "MEMBER", "PENDING", "DECLINED", "EXPIRED"
    private LocalDateTime joinedAt;
    private LocalDateTime invitedAt;
    private LocalDateTime expiresAt;

    public HouseholdMemberResponse() {
    }

    public HouseholdMemberResponse(String memberId, String email, String firstName, 
                                   String lastName, String status) {
        this.memberId = memberId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.status = status;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
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
