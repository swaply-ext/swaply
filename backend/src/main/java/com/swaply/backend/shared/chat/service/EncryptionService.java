package com.swaply.backend.shared.chat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class EncryptionService {

    // En producción, esta clave debe estar en variables de entorno o Azure Key Vault
    // Debe tener 16, 24 o 32 caracteres para AES-128, 192 o 256
    @Value("${chat-secret-key}")
    private String secretKey;

    private static final String ALGORITHM = "AES";

    public String encrypt(String value) {
        try {
            if (value == null) return null;
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            byte[] encryptedValue = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedValue);
        } catch (Exception e) {
            throw new RuntimeException("Error al cifrar el mensaje", e);
        }
    }

    public String decrypt(String encryptedValue) {
        try {
            if (encryptedValue == null) return null;
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            byte[] decodedValue = Base64.getDecoder().decode(encryptedValue);
            return new String(cipher.doFinal(decodedValue), StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Si falla el descifrado (ej. datos antiguos no cifrados), devolvemos el original o logueamos
            return encryptedValue; 
        }
    }
}
