package com.rosterloop.rosterloop.service;

import com.rosterloop.rosterloop.dto.LoginRequest;
import com.rosterloop.rosterloop.dto.SignupRequest;
import com.rosterloop.rosterloop.dto.AuthResponse;
import com.rosterloop.rosterloop.entity.User;
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
            throw new RuntimeException("Email is already registered");
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

        AuthResponse response = new AuthResponse(
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
        return response;
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
            throw new RuntimeException("Invalid email or password");
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
            throw new RuntimeException("Email is already registered");
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
}
