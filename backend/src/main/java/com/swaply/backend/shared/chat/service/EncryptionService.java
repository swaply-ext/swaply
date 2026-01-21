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

    // La clave debe ser de 32 caracteres (bytes) para AES-256
    @Value("${chat-secret-key}")
    private String secretKey;

    // Usamos AES con modo GCM y sin padding (GCM lo maneja)
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    // Longitud estándar del TAG de autenticación (128 bits)
    private static final int GCM_TAG_LENGTH = 128;
    // Longitud estándar del IV (12 bytes es lo recomendado para GCM)
    private static final int IV_LENGTH = 12;

    public String encrypt(String value) {
        try {
            if (value == null) return null;

            // 1. Generar un IV (Vector de Inicialización) aleatorio único para este mensaje
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            // 2. Configurar el cifrado
            final Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "AES");
            
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);

            // 3. Cifrar
            byte[] cipherText = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));

            // 4. Concatenar IV + Texto Cifrado (Necesitamos el IV para descifrar después)
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            // 5. Devolver como String Base64
            return Base64.getEncoder().encodeToString(byteBuffer.array());

        } catch (Exception e) {
            throw new RuntimeException("Error al cifrar el mensaje", e);
        }
    }

    public String decrypt(String encryptedValue) {
        try {
            if (encryptedValue == null) return null;

            // 1. Decodificar Base64
            byte[] decodedValue = Base64.getDecoder().decode(encryptedValue);

            // 2. Separar el IV del mensaje cifrado
            // Usamos ByteBuffer para leer fácilmente
            ByteBuffer byteBuffer = ByteBuffer.wrap(decodedValue);

            byte[] iv = new byte[IV_LENGTH];
            byteBuffer.get(iv); // Leemos los primeros 12 bytes (el IV)

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText); // Leemos el resto (el mensaje)

            // 3. Configurar el descifrado
            final Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "AES");

            cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmSpec);

            // 4. Descifrar
            byte[] plainText = cipher.doFinal(cipherText);

            return new String(plainText, StandardCharsets.UTF_8);

        } catch (Exception e) {
            // Manejo de errores (ej: clave incorrecta, datos corruptos, o formato antiguo)
            System.err.println("Error descifrando: " + e.getMessage());
            return encryptedValue; // O lanzar excepción según tu lógica de negocio
        }
    }
}