package com.rosterloop.rosterloop.dto;

/**
 * DTO for creating an admin user with secure token
 */
public class CreateAdminRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String adminToken;

    public CreateAdminRequest() {
    }

    public CreateAdminRequest(String email, String password, String firstName, String lastName, String adminToken) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.adminToken = adminToken;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getAdminToken() {
        return adminToken;
    }

    public void setAdminToken(String adminToken) {
        this.adminToken = adminToken;
    }
}
