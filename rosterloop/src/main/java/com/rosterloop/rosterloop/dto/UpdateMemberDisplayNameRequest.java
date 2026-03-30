package com.rosterloop.rosterloop.dto;

/**
 * DTO for updating member display name
 */
public class UpdateMemberDisplayNameRequest {
    private String displayName;

    public UpdateMemberDisplayNameRequest() {
    }

    public UpdateMemberDisplayNameRequest(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
}
