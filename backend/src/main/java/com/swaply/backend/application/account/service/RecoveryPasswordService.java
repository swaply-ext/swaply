package com.swaply.backend.application.account.service;

import java.util.Random;

import com.swaply.backend.application.auth.dto.LoginDTO;
import com.swaply.backend.application.auth.dto.RegisterDTO;
import com.swaply.backend.application.auth.exception.InvalidCredentialsException;
import com.swaply.backend.application.auth.exception.UserAlreadyExistsException;
import com.swaply.backend.application.auth.service.PasswordService;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;
import com.swaply.backend.shared.mail.MailService;
import com.swaply.backend.shared.token.JwtService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class RecoveryPasswordService {

    private final UserService userService; //
    private final MailService mailService;
    private final PasswordService passwordService;
    private final JwtService jwtService;

    @Value("${frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

    public RecoveryPasswordService(UserService userService,
            MailService mailService, PasswordService passwordService,
            JwtService jwtService) {
        this.userService = userService;
        this.mailService = mailService;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
    }

    public void generateAndSendResetLink(String email) {
        UserDTO user;
        try {
            user = userService.getUserByEmail(email);
        } catch (UserNotFoundException e) {
            return;
        }

        // 2. Genera el token para el usuario
        String token = jwtService.generatePasswordResetToken(user.getId());

        // 3. Construye la URL completa con el token como parámetro
        String fullUrl = UriComponentsBuilder.fromHttpUrl(resetPasswordBaseUrl)
                .queryParam("token", token)
                .toUriString();

        // El resultado será algo como:
        // "https://mi.sitio.web/cambiar-contrasena?token=eyJhbGciOiJI..."

        System.out.println("URL de reseteo generada: " + fullUrl);

        // 4. Envía la URL por correo electrónico
        mailService.sendPasswordResetEmail(user.getEmail(), fullUrl);
    }

    public void resetPassword(String token, String newPassword) {
        try {

            String userId = jwtService.extractUserIdFromPasswordResetToken(token);

            userService.updateUserPassword(userId, newPassword);

        } catch (Exception e) {
            // Hay que ver si creamos una exception aqui también
            throw new RuntimeException("El enlace no es válido o ha expirado.", e);
        }
    }

}