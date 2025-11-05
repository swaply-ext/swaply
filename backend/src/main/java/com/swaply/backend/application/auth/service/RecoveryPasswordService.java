package com.swaply.backend.application.auth.service;

import com.swaply.backend.application.auth.dto.ResetPasswordDTO;
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
    private final JwtService jwtService;

    @Value("${frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

    public RecoveryPasswordService(UserService userService,
            MailService mailService,
            JwtService jwtService) {
        this.userService = userService;
        this.mailService = mailService;
        this.jwtService = jwtService;
    }

    public void generateAndSendResetLink(String email) {
        UserDTO user = userService.getUserByEmail(email);
        String token = jwtService.generatePasswordResetToken(user.getId());

        String fullUrl = UriComponentsBuilder.fromHttpUrl(resetPasswordBaseUrl)
                .queryParam("token", token)
                .toUriString();

        System.out.println("URL de reseteo generada: " + fullUrl);
        mailService.sendPasswordResetEmail(user.getEmail(), fullUrl);
    }

    public void resetPassword(ResetPasswordDTO dto) {
        try {
            String userId = jwtService.extractUserIdFromPasswordResetToken(dto.getToken());
            userService.updateUserPassword(userId, dto.getNewPassword());

        } catch (Exception e) {
            // Hay que ver si creamos una exception aqui también
            System.out.println("Error al resetear la contraseña: " + e.getMessage());
            throw new RuntimeException("El enlace no es válido o ha expirado.", e);
        }
    }

}