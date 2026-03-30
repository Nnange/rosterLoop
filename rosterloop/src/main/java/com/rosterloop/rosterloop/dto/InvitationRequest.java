package com.rosterloop.rosterloop.dto;

public class InvitationRequest {
    private String inviteeEmail;

    public InvitationRequest() {}

    public InvitationRequest(String inviteeEmail) {
        this.inviteeEmail = inviteeEmail;
    }

    public String getInviteeEmail() {
        return inviteeEmail;
    }

    public void setInviteeEmail(String inviteeEmail) {
        this.inviteeEmail = inviteeEmail;
    }
}
