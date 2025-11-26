package com.swaply.backend.application.auth.service;

import com.swaply.backend.application.auth.AuthMapper;
import com.swaply.backend.application.auth.dto.ChangePasswordDTO;
import com.swaply.backend.application.auth.dto.ResetPasswordDTO;
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

        //Codigo de resetPassword, como referencia
       /* 
        try {
            String newRawPassword = dto.getPassword(); //nueva pass en texto plano para comparar
            UserDTO currentUser = userService.getUserByID(userId); //obtenir la contraseña antigua para comparar
            String currentHashedPassword = currentUser.getPassword();
            if (passwordService.match(newRawPassword, currentHashedPassword)) { //if que hace condiciona si son iguales o no
                throw new NewPasswordMatchesOldException("La nueva contraseña no puede ser igual a la anterior.");
            }
            userService.updateUserPassword(userId, newRawPassword);
            String newPassword = passwordService.hash(dto.getPassword());
            dto.setPassword(newPassword);
            System.out.println(dto.getPassword());
            UserDTO user = mapper.fromResetPasswordDTO(dto);
            userService.updateUser(userId, user);
 
        catch (Exception e) {
            // Hay que ver si creamos una exception aqui también
            System.out.println("Error al resetear la contraseña: " + e.getMessage());
        }
        */
    }

}