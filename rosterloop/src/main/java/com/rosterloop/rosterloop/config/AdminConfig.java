package com.rosterloop.rosterloop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for admin-related settings
 * Provides secure admin creation token
 */
@Configuration
public class AdminConfig {
    
    @Value("${app.admin.creation-token:}")
    private String adminCreationToken;

    public String getAdminCreationToken() {
        return adminCreationToken;
    }

    /**
     * Validates the provided token against the configured admin creation token
     * @param token The token to validate
     * @return true if token is valid and configured
     */
    public boolean isValidAdminToken(String token) {
        if (adminCreationToken == null || adminCreationToken.isEmpty()) {
            return false;
        }
        return adminCreationToken.equals(token);
    }
}
