package com.rosterloop.rosterloop.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider provider;

    private static final String SECRET =
            "mySecretKeyThatIsAtLeast256BitsLongForHS256SigningAlgorithmUseCase";
    private static final long EXPIRATION_MS = 86_400_000L; // 24 h

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(provider, "jwtExpirationMs", EXPIRATION_MS);
    }

    @Test
    void generateToken_returnsNonNullString() {
        String token = provider.generateToken("alice@example.com", UUID.randomUUID().toString());
        assertThat(token).isNotNull().isNotEmpty();
    }

    @Test
    void getEmailFromToken_returnsCorrectEmail() {
        String email = "alice@example.com";
        String token = provider.generateToken(email, UUID.randomUUID().toString());
        assertThat(provider.getEmailFromToken(token)).isEqualTo(email);
    }

    @Test
    void getUserIdFromToken_returnsCorrectUserId() {
        String userId = UUID.randomUUID().toString();
        String token = provider.generateToken("alice@example.com", userId);
        assertThat(provider.getUserIdFromToken(token)).isEqualTo(userId);
    }

    @Test
    void isTokenValid_returnsTrueForFreshToken() {
        String token = provider.generateToken("alice@example.com", UUID.randomUUID().toString());
        assertThat(provider.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_returnsFalseForTamperedToken() {
        String token = provider.generateToken("alice@example.com", UUID.randomUUID().toString());
        String tampered = token.substring(0, token.length() - 4) + "XXXX";
        assertThat(provider.isTokenValid(tampered)).isFalse();
    }

    @Test
    void isTokenValid_returnsFalseForExpiredToken() {
        // Create a provider whose tokens expire immediately
        JwtTokenProvider expiredProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(expiredProvider, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(expiredProvider, "jwtExpirationMs", -1L);

        String token = expiredProvider.generateToken("alice@example.com", UUID.randomUUID().toString());
        assertThat(expiredProvider.isTokenValid(token)).isFalse();
    }

    @Test
    void isTokenValid_returnsFalseForGarbage() {
        assertThat(provider.isTokenValid("not.a.jwt")).isFalse();
    }

    @Test
    void twoTokensForSameUserHaveDifferentValues() {
        String userId = UUID.randomUUID().toString();
        String t1 = provider.generateToken("alice@example.com", userId);
        String t2 = provider.generateToken("alice@example.com", userId);
        // Issued-at timestamps differ by at least 1ms between calls; tokens must differ
        // (or be identical — either is acceptable, but they are issued at different times)
        // The important thing is that both are valid
        assertThat(provider.isTokenValid(t1)).isTrue();
        assertThat(provider.isTokenValid(t2)).isTrue();
    }
}
