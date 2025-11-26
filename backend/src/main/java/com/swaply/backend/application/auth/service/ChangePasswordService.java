package com.swaply.backend.application.auth.service;

import com.swaply.backend.application.auth.AuthMapper;
import com.swaply.backend.application.auth.dto.ChangePasswordDTO;
import com.swaply.backend.application.auth.dto.ResetPasswordDTO;
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

    private final UserService userService; //
    private final JwtService jwtService;
    private final AuthMapper mapper;
    private final PasswordService passwordService;

    @Value("${frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

    public ChangePasswordService(UserService userService,
            MailService mailService,
            JwtService jwtService, AuthMapper mapper, PasswordService passwordService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.mapper = mapper;
        this.passwordService = passwordService;
    }

    public void changePassword(String userId, String newPassword, String password) {

        try {
            // verifica que la contraseña nueva no sea igual a la antigua
            UserDTO currentUser = userService.getUserByID(userId);
            String currentHashedPassword = currentUser.getPassword();
            if (passwordService.match(newPassword, currentHashedPassword)) {
                throw new NewPasswordMatchesOldException("La nueva contraseña no puede ser igual a la anterior.");
            }
            // verifica la contraseña actual
            if (!passwordService.match(password, currentHashedPassword)) {
                throw new InvalidCredentialsException("La  contraseña no coincide con la anterior.");
            }
            // actuliza la contraseña
            userService.updateUserPassword(userId, newPassword);
            System.out.println(newPassword);
            

        } catch (Exception e) { 
            System.out.println("Error al cambiar la contraseña: " + e.getMessage());
        }
    }
}
