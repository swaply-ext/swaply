package com.swaply.backend.shared.token;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    // Es una BUENA PRÁCTICA usar una clave secreta DIFERENTE para los tokens de
    // reseteo
    // que para los tokens de sesión. Puedes cargarla desde application.properties
    @Value("${jwt-secret-passwordReset}")
    private String passwordResetSecretKey;

    @Value("${jwt-secret-session}")
    private String idTokenSecretKey;

    private static final long RESET_TOKEN_EXPIRATION = 900000; // 15 minutos en milisegundos

    private static final long SESSION_TOKEN_EXPIRATION = 900000; // Hay que hacer esto configurable en otra medida. No
                                                                 // solo ms

    private String buildToken(String userId, String type, long expiration, String secret) {
        return Jwts.builder()
                .subject(userId) // Guardamos el ID del usuario aquí
                .claim("type", type) // Claim para diferenciarlo
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(secret), Jwts.SIG.HS256)
                .compact();
    }

    public String generatePasswordResetToken(String userId) {
        String token = buildToken(
                userId, "password-reset",
                RESET_TOKEN_EXPIRATION,
                passwordResetSecretKey);
        return token;
    }

    public String generateSessionToken(String userId) {
        String token = buildToken(
                userId, "session",
                SESSION_TOKEN_EXPIRATION,
                idTokenSecretKey);
        return token;
    }

    private SecretKey getSigningKey(String secret) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUserIdFromPasswordResetToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey(passwordResetSecretKey))
                .build()
                .parseSignedClaims(token)
                .getPayload();

        // Verificación extra del tipo de token
        String tokenType = claims.get("type", String.class);
        if (!"password-reset".equals(tokenType)) {
            throw new IllegalArgumentException("Token inválido: no es para reseteo de contraseña.");
        }

        return claims.getSubject();
    }

}