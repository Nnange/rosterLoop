package com.rosterloop.rosterloop.controller;

import com.rosterloop.rosterloop.config.AdminConfig;
import com.rosterloop.rosterloop.dto.LoginRequest;
import com.rosterloop.rosterloop.dto.SignupRequest;
import com.rosterloop.rosterloop.dto.AuthResponse;
import com.rosterloop.rosterloop.dto.CreateAdminRequest;
import com.rosterloop.rosterloop.dto.AdminCreatedResponse;
import com.rosterloop.rosterloop.dto.ErrorResponse;
import com.rosterloop.rosterloop.entity.User;
import com.rosterloop.rosterloop.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.178.36:3002", "https://rosterloop.awongnnange.com"})
@RestController
@RequestMapping("/rosterloop/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AdminConfig adminConfig;

    public AuthController(AuthService authService, AdminConfig adminConfig) {
        this.authService = authService;
        this.adminConfig = adminConfig;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        try {
            AuthResponse response = authService.signup(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        User user = (User) authentication.getPrincipal();
        AuthResponse response = new AuthResponse(
                null, // No token needed for /me endpoint
                "Bearer",
                0,
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getIsEmailVerified()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create-admin")
    public ResponseEntity<Object> createAdmin(@RequestBody CreateAdminRequest request) {
        try {
            // Validate admin token
            if (!adminConfig.isValidAdminToken(request.getAdminToken())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Invalid or missing admin token"));
            }

            // Validate input
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Email is required"));
            }
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Password must be at least 6 characters"));
            }

            User admin = authService.createAdmin(
                    request.getEmail(),
                    request.getPassword(),
                    request.getFirstName(),
                    request.getLastName()
            );

            AdminCreatedResponse response = new AdminCreatedResponse(
                    admin.getEmail(),
                    admin.getFirstName(),
                    admin.getLastName(),
                    admin.getRole(),
                    "Admin user created successfully"
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("already registered")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to create admin user"));
        }
    }

    @DeleteMapping("/account")
    public ResponseEntity<Object> deleteAccount(org.springframework.security.core.Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("User not authenticated"));
            }

            User user = (User) authentication.getPrincipal();
            authService.deleteAccount(user.getId());

            return ResponseEntity.ok(new ErrorResponse("Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to delete account: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Object> verifyEmail(@RequestParam String email) {
        try {
            authService.verifyEmail(email);
            return ResponseEntity.ok(new ErrorResponse("Email verified successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to verify email: " + e.getMessage()));
        }
    }
}
