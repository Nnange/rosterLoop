package com.rosterloop.rosterloop.service;

import com.rosterloop.rosterloop.dto.LoginRequest;
import com.rosterloop.rosterloop.dto.SignupRequest;
import com.rosterloop.rosterloop.dto.AuthResponse;
import com.rosterloop.rosterloop.entity.User;
import com.rosterloop.rosterloop.exception.AuthServiceException;
import com.rosterloop.rosterloop.repository.UserRepository;
import com.rosterloop.rosterloop.repository.HouseholdMemberRepository;
import com.rosterloop.rosterloop.repository.HouseholdInvitationRepository;
import com.rosterloop.rosterloop.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final HouseholdInvitationRepository householdInvitationRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public AuthService(UserRepository userRepository,
                      HouseholdMemberRepository householdMemberRepository,
                      HouseholdInvitationRepository householdInvitationRepository,
                      EmailService emailService,
                      PasswordEncoder passwordEncoder,
                      AuthenticationManager authenticationManager,
                      JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.householdMemberRepository = householdMemberRepository;
        this.householdInvitationRepository = householdInvitationRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthServiceException("Email is already registered");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setIsActive(true);
        user.setIsEmailVerified(false);
        user.setRole("ROLE_USER");
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        
        // Send verification email
        String verificationLink = frontendUrl + "/verify-email?email=" + savedUser.getEmail();
        emailService.sendVerificationEmail(savedUser.getEmail(), verificationLink);

        String token = jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getId().toString());

        return new AuthResponse(
                token,
                "Bearer",
                3600,
                savedUser.getId().toString(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getRole(),
                savedUser.getIsEmailVerified()
        );
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            User user = (User) authentication.getPrincipal();

            if (user == null) {
                throw new AuthServiceException("Authentication failed");
            }
            
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId().toString());

            return new AuthResponse(
                token,
                "Bearer",
                3600,
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
            );
        } catch (Exception e) {
            throw new AuthServiceException("Invalid email or password");
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserById(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User createAdmin(String email, String password, String firstName, String lastName) {
        if (userRepository.existsByEmail(email)) {
            throw new AuthServiceException("Email is already registered");
        }

        User admin = new User();
        admin.setId(UUID.randomUUID());
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        admin.setIsActive(true);
        admin.setIsEmailVerified(true);
        admin.setRole("ROLE_ADMIN");
        admin.setCreatedAt(LocalDateTime.now());

        return userRepository.save(admin);
    }

    @Transactional
    public void deleteAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Delete all household members for this user
        householdMemberRepository.deleteAll(householdMemberRepository.findByUserId(userId));
        
        // Delete all invitations sent BY this user (where they are the inviter)
        householdInvitationRepository.deleteAll(
            householdInvitationRepository.findByInviterId(userId)
        );
        
        // Delete all invitations sent TO this user (where they are the invitee)
        householdInvitationRepository.deleteAll(
            householdInvitationRepository.findByInviteeEmail(user.getEmail())
        );
        
        // Delete the user account - cascade delete will handle remaining records
        userRepository.delete(user);
        userRepository.flush(); // Ensure changes are flushed to database
    }

    @Transactional
    public void verifyEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        user.setIsEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);
        
        user.setResetToken(resetToken);
        user.setResetTokenExpiresAt(expiresAt);
        userRepository.save(user);
        
        // Send reset email
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(email, resetLink);
    }

    @Transactional
    public boolean verifyResetToken(String token) {
        User user = userRepository.findByResetToken(token)
                .orElse(null);
        
        return user != null && user.getResetTokenExpiresAt() != null && user.getResetTokenExpiresAt().isAfter(LocalDateTime.now());
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));
        
        if (user.getResetTokenExpiresAt() == null || user.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AuthServiceException("Reset token has expired");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);
    }

    @Transactional
    public void updateProfile(UUID userId, String firstName, String lastName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new AuthServiceException("Current password is incorrect");
        }
        
        if (currentPassword.equals(newPassword)) {
            throw new AuthServiceException("New password must be different from current password");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
