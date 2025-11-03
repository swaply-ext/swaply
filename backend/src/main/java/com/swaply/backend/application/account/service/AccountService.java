package com.swaply.backend.application.account.service;

import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UpdateUserDTO;
import com.swaply.backend.shared.mail.MailService;
import com.swaply.backend.shared.token.JwtService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AccountService /* implements UserRepository */ {

    private final UserService userService; //
    private final JwtService jwtService;

    @Value("${frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

    public AccountService(UserService userService,
            MailService mailService,
            JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public void UpdatePersonalInfo(String token, UpdateUserDTO dto) {
        try {
            String userId = jwtService.extractUserIdFromSessionToken(token);

            userService.updateUser(userId, dto);

        } catch (Exception e) {
            // Hay que ver si creamos una exception aqui también
            throw new RuntimeException("No se ha podido actualizar la informacion  del usuario", e);
        }
    }
}