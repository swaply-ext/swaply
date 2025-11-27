package com.swaply.backend.application.auth.service;

import com.swaply.backend.application.auth.AuthMapper;
import com.swaply.backend.application.auth.dto.ChangePasswordDTO;
import com.swaply.backend.application.auth.exception.InvalidCredentialsException;
import com.swaply.backend.application.auth.exception.NewPasswordMatchesOldException;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.mail.MailService;
import com.swaply.backend.shared.token.JwtService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ChangePasswordService {

    private final UserService userService; 
    private final PasswordService passwordService;

    @Value("${frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

    public ChangePasswordService(UserService userService,
            MailService mailService,
            JwtService jwtService, AuthMapper mapper, PasswordService passwordService) {
        this.userService = userService;
        this.passwordService = passwordService;
    }

    public void changePassword(String userId, ChangePasswordDTO dto) {

        try {
            // verifica que la contraseña nueva no sea igual a la antigua
            UserDTO currentUser = userService.getUserByID(userId);
            String currentHashedPassword = currentUser.getPassword();
            if (passwordService.match(dto.getNewPassword(), currentHashedPassword)) {
                throw new NewPasswordMatchesOldException("La nueva contraseña no puede ser igual a la anterior.");
            }
            // verifica la contraseña actual
            if (!passwordService.match(dto.getPassword(), currentHashedPassword)) {
                throw new InvalidCredentialsException("La  contraseña no coincide con la anterior.");
            }
            // actuliza la contraseña
            userService.updateUserPassword(userId, dto.getNewPassword());
            System.out.println(dto.getNewPassword());
            

        } catch (Exception e) { 
            System.out.println("Error al cambiar la contraseña: " + e.getMessage());
        }
    }
}
