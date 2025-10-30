package com.swaply.backend.shared.token;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.time.Duration;

@Service
public class JwtService {

    // @Value("${jwt-secret-passwordReset}")
    @Value("${jwt-secret-key}") // Temporal hasta generar ambos secretos
    private String passwordResetSecretKey;

    // @Value("${jwt-secret-session}")
    @Value("${jwt-secret-key}") // Temporal hasta generar ambos secretos
    private String sessionSecretKey;

    private static final Duration RESET_TOKEN_EXPIRATION = Duration.ofMinutes(15);
    private static final String RESET_TOKEN_TYPE = "password-reset";

    private static final Duration SESSION_TOKEN_EXPIRATION = Duration.ofDays(7);
    private static final String SESSION_TOKEN_TYPE = "session";

    private String buildToken(String userId, String type, Duration expiration, String secret) {
        return Jwts.builder()
                .subject(userId)
                .claim("type", type) // Tipo de token
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration.toMillis())) // Conversion a milisegundos
                .signWith(getSigningKey(secret), Jwts.SIG.HS256)
                .compact();
    }

    public String generatePasswordResetToken(String userId) {
        return buildToken(
                userId, RESET_TOKEN_TYPE,
                RESET_TOKEN_EXPIRATION,
                passwordResetSecretKey);
    }

    public String generateSessionToken(String userId) {
        return buildToken(
                userId, SESSION_TOKEN_TYPE,
                SESSION_TOKEN_EXPIRATION,
                sessionSecretKey);

    }

    private SecretKey getSigningKey(String secret) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String extractIdFromToken(String token, String secret, String type) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey(secret))
                .build()
                .parseSignedClaims(token)
                .getPayload();
        String tokentype = claims.get("type", String.class);
        if (!type.equals(tokentype)) {
            throw new IllegalArgumentException("Token inválido: no es del tipo esperado.");
        }
        String userId = claims.getSubject();
        return userId;
    }

    public String extractUserIdFromPasswordResetToken(String token) {
        return extractIdFromToken(
                token,
                passwordResetSecretKey,
                RESET_TOKEN_TYPE);
    }

    public String extractUserIdFromSessionToken(String token) {
        return extractIdFromToken(
                token,
                sessionSecretKey,
                SESSION_TOKEN_TYPE);
    }

}