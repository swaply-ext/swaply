package com.swaply.backend.shared.chat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class EncryptionService {

    @Value("${chat-secret-key}")
    private String secretKey;

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_LENGTH = 12;

    public String encrypt(String value) {
        try {
            if (value == null) return null;

            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            final Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "AES");
            
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);

            byte[] cipherText = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));

            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return Base64.getEncoder().encodeToString(byteBuffer.array());

        } catch (Exception e) {
            throw new RuntimeException("Error al cifrar el mensaje", e);
        }
    }

    public String decrypt(String encryptedValue) {
        try {
            if (encryptedValue == null) return null;

            byte[] decodedValue = Base64.getDecoder().decode(encryptedValue);

            ByteBuffer byteBuffer = ByteBuffer.wrap(decodedValue);

            byte[] iv = new byte[IV_LENGTH];
            byteBuffer.get(iv); 

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText); 

            final Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "AES");

            cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmSpec);

            byte[] plainText = cipher.doFinal(cipherText);

            return new String(plainText, StandardCharsets.UTF_8);

        } catch (Exception e) {
            System.err.println("Error descifrando: " + e.getMessage());
            return encryptedValue; 
        }
    }
}