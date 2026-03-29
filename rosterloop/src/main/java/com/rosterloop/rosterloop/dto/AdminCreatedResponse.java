package com.rosterloop.rosterloop.dto;

/**
 * DTO for admin creation response
 */
public class AdminCreatedResponse {
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String message;

    public AdminCreatedResponse() {
    }

    public AdminCreatedResponse(String email, String firstName, String lastName, String role, String message) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.message = message;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
