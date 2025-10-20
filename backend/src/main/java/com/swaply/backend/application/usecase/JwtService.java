package com.swaply.backend.application.usecase;

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

    // Es una BUENA PRÁCTICA usar una clave secreta DIFERENTE para los tokens de reseteo
    // que para los tokens de sesión. Puedes cargarla desde application.properties
    @Value("${jwt-secret-key}")
    private String passwordResetSecretKey;

    

    private static final long RESET_TOKEN_EXPIRATION = 900000; // 15 minutos en milisegundos

    /**
     * Genera un token específico para el reseteo de contraseña.
     * @param userId El ID del usuario.
     * @return El token JWT.
     */
    public String generatePasswordResetToken(String userId) {
        return Jwts.builder()
                .subject(userId) // Guardamos el ID del usuario aquí
                .claim("type", "password-reset") // Claim para diferenciarlo
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + RESET_TOKEN_EXPIRATION))
                .signWith(getResetSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Valida un token de reseteo y extrae el ID del usuario.
     * Lanza una excepción si el token es inválido o ha expirado.
     * @param token El token a validar.
     * @return El ID del usuario.
     */
    public String extractUserIdFromPasswordResetToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getResetSigningKey())
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

    private SecretKey getResetSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(passwordResetSecretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}