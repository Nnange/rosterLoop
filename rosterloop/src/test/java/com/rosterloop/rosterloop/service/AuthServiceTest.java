package com.rosterloop.rosterloop.service;

import com.rosterloop.rosterloop.dto.AuthResponse;
import com.rosterloop.rosterloop.dto.LoginRequest;
import com.rosterloop.rosterloop.dto.SignupRequest;
import com.rosterloop.rosterloop.entity.User;
import com.rosterloop.rosterloop.exception.AuthServiceException;
import com.rosterloop.rosterloop.repository.HouseholdInvitationRepository;
import com.rosterloop.rosterloop.repository.HouseholdMemberRepository;
import com.rosterloop.rosterloop.repository.UserRepository;
import com.rosterloop.rosterloop.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private HouseholdMemberRepository householdMemberRepository;
    @Mock private HouseholdInvitationRepository householdInvitationRepository;
    @Mock private EmailService emailService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider jwtTokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository, householdMemberRepository, householdInvitationRepository,
                emailService, passwordEncoder, authenticationManager, jwtTokenProvider);
        ReflectionTestUtils.setField(authService, "frontendUrl", "http://localhost:3000");
    }

    // ── signup ────────────────────────────────────────────────────────────────

    @Test
    void signup_throwsWhenEmailAlreadyRegistered() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        SignupRequest req = signupRequest("alice@example.com", "pass", "Alice", "Smith");
        assertThatThrownBy(() -> authService.signup(req))
                .isInstanceOf(AuthServiceException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    void signup_savesUserAndReturnsAuthResponse() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-pass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtTokenProvider.generateToken(anyString(), anyString())).thenReturn("jwt-token");

        AuthResponse resp = authService.signup(signupRequest("alice@example.com", "pass", "Alice", "Smith"));

        assertThat(resp.getAccessToken()).isEqualTo("jwt-token");
        assertThat(resp.getEmail()).isEqualTo("alice@example.com");
        assertThat(resp.getFirstName()).isEqualTo("Alice");
        assertThat(resp.getEmailVerified()).isFalse();
    }

    @Test
    void signup_sendsVerificationEmail() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtTokenProvider.generateToken(anyString(), anyString())).thenReturn("t");

        authService.signup(signupRequest("alice@example.com", "pass", "Alice", "Smith"));

        verify(emailService).sendVerificationEmail(eq("alice@example.com"), anyString());
    }

    @Test
    void signup_encodesPassword() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("rawpass")).thenReturn("hashed");
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtTokenProvider.generateToken(anyString(), anyString())).thenReturn("t");

        authService.signup(signupRequest("alice@example.com", "rawpass", "Alice", "Smith"));

        assertThat(captor.getValue().getPassword()).isEqualTo("hashed");
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_throwsAuthServiceExceptionOnBadCredentials() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad"));

        LoginRequest req = new LoginRequest();
        req.setEmail("alice@example.com");
        req.setPassword("wrong");

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(AuthServiceException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_returnsAuthResponseOnSuccess() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateToken(anyString(), anyString())).thenReturn("jwt");

        LoginRequest req = new LoginRequest();
        req.setEmail("alice@example.com");
        req.setPassword("pass");

        AuthResponse resp = authService.login(req);

        assertThat(resp.getAccessToken()).isEqualTo("jwt");
        assertThat(resp.getEmail()).isEqualTo("alice@example.com");
    }

    // ── verifyEmail ───────────────────────────────────────────────────────────

    @Test
    void verifyEmail_setsEmailVerifiedTrue() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        authService.verifyEmail("alice@example.com");

        assertThat(user.getIsEmailVerified()).isTrue();
    }

    @Test
    void verifyEmail_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verifyEmail("missing@example.com"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    // ── sendPasswordResetEmail ────────────────────────────────────────────────

    @Test
    void sendPasswordResetEmail_setsResetTokenAndExpiry() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        authService.sendPasswordResetEmail("alice@example.com");

        assertThat(user.getResetToken()).isNotNull();
        assertThat(user.getResetTokenExpiresAt()).isAfter(LocalDateTime.now());
    }

    @Test
    void sendPasswordResetEmail_sendsEmail() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        authService.sendPasswordResetEmail("alice@example.com");

        verify(emailService).sendPasswordResetEmail(eq("alice@example.com"), anyString());
    }

    @Test
    void sendPasswordResetEmail_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.sendPasswordResetEmail("missing@example.com"))
                .isInstanceOf(RuntimeException.class);
    }

    // ── verifyResetToken ──────────────────────────────────────────────────────

    @Test
    void verifyResetToken_trueForValidNonExpiredToken() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        user.setResetToken("tok");
        user.setResetTokenExpiresAt(LocalDateTime.now().plusHours(1));
        when(userRepository.findByResetToken("tok")).thenReturn(Optional.of(user));

        assertThat(authService.verifyResetToken("tok")).isTrue();
    }

    @Test
    void verifyResetToken_falseWhenTokenNotFound() {
        when(userRepository.findByResetToken("nope")).thenReturn(Optional.empty());

        assertThat(authService.verifyResetToken("nope")).isFalse();
    }

    @Test
    void verifyResetToken_falseForExpiredToken() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        user.setResetToken("tok");
        user.setResetTokenExpiresAt(LocalDateTime.now().minusMinutes(1));
        when(userRepository.findByResetToken("tok")).thenReturn(Optional.of(user));

        assertThat(authService.verifyResetToken("tok")).isFalse();
    }

    // ── resetPassword ─────────────────────────────────────────────────────────

    @Test
    void resetPassword_updatesPasswordAndClearsToken() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        user.setResetToken("tok");
        user.setResetTokenExpiresAt(LocalDateTime.now().plusHours(1));
        when(userRepository.findByResetToken("tok")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newpass")).thenReturn("encoded-new");
        when(userRepository.save(any())).thenReturn(user);

        authService.resetPassword("tok", "newpass");

        assertThat(user.getPassword()).isEqualTo("encoded-new");
        assertThat(user.getResetToken()).isNull();
        assertThat(user.getResetTokenExpiresAt()).isNull();
    }

    @Test
    void resetPassword_throwsForExpiredToken() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        user.setResetToken("tok");
        user.setResetTokenExpiresAt(LocalDateTime.now().minusMinutes(1));
        when(userRepository.findByResetToken("tok")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.resetPassword("tok", "newpass"))
                .isInstanceOf(AuthServiceException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void resetPassword_throwsWhenTokenNotFound() {
        when(userRepository.findByResetToken("bad")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.resetPassword("bad", "newpass"))
                .isInstanceOf(RuntimeException.class);
    }

    // ── changePassword ────────────────────────────────────────────────────────

    @Test
    void changePassword_throwsWhenCurrentPasswordIncorrect() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        UUID userId = user.getId();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", user.getPassword())).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword(userId, "wrong", "newpass"))
                .isInstanceOf(AuthServiceException.class)
                .hasMessageContaining("Current password is incorrect");
    }

    @Test
    void changePassword_throwsWhenNewPasswordSameAsCurrent() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        UUID userId = user.getId();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("same", user.getPassword())).thenReturn(true);

        assertThatThrownBy(() -> authService.changePassword(userId, "same", "same"))
                .isInstanceOf(AuthServiceException.class)
                .hasMessageContaining("different");
    }

    @Test
    void changePassword_updatesPasswordOnSuccess() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old", user.getPassword())).thenReturn(true);
        when(passwordEncoder.encode("new")).thenReturn("encoded-new");
        when(userRepository.save(any())).thenReturn(user);

        authService.changePassword(user.getId(), "old", "new");

        assertThat(user.getPassword()).isEqualTo("encoded-new");
    }

    // ── updateProfile ─────────────────────────────────────────────────────────

    @Test
    void updateProfile_updatesFirstAndLastName() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        authService.updateProfile(user.getId(), "Alicia", "Jones");

        assertThat(user.getFirstName()).isEqualTo("Alicia");
        assertThat(user.getLastName()).isEqualTo("Jones");
    }

    // ── deleteAccount ─────────────────────────────────────────────────────────

    @Test
    void deleteAccount_deletesAllRelatedDataAndUser() {
        User user = savedUser("alice@example.com", "Alice", "Smith");
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(householdMemberRepository.findByUserId(user.getId())).thenReturn(Collections.emptyList());
        when(householdInvitationRepository.findByInviterId(user.getId())).thenReturn(Collections.emptyList());
        when(householdInvitationRepository.findByInviteeEmail(user.getEmail())).thenReturn(Collections.emptyList());

        authService.deleteAccount(user.getId());

        verify(userRepository).delete(user);
    }

    @Test
    void deleteAccount_throwsWhenUserNotFound() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.deleteAccount(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private static SignupRequest signupRequest(String email, String password,
                                               String firstName, String lastName) {
        SignupRequest req = new SignupRequest();
        req.setEmail(email);
        req.setPassword(password);
        req.setFirstName(firstName);
        req.setLastName(lastName);
        return req;
    }

    private static User savedUser(String email, String firstName, String lastName) {
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setEmail(email);
        u.setPassword("stored-hash");
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setIsActive(true);
        u.setIsEmailVerified(false);
        u.setRole("ROLE_USER");
        return u;
    }
}
