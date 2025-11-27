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
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class RecoveryPasswordService {

    private final UserService userService; //
    private final MailService mailService;
    private final JwtService jwtService;
    private final AuthMapper mapper;
    private final PasswordService passwordService;

    @Value("${frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

    public RecoveryPasswordService(UserService userService,
            MailService mailService,
            JwtService jwtService, AuthMapper mapper, PasswordService passwordService) {
        this.userService = userService;
        this.mailService = mailService;
        this.jwtService = jwtService;
        this.mapper = mapper;
        this.passwordService = passwordService;
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
            
            //excepcion cuando coincide passwd
        } catch (NewPasswordMatchesOldException e) {
            System.out.println("Error al resetear la contraseña: " + e.getMessage());
            throw e;
        }   
        catch (Exception e) {
            // Hay que ver si creamos una exception aqui también
            System.out.println("Error al resetear la contraseña: " + e.getMessage());
            throw new RuntimeException("El enlace no es válido o ha expirado.", e);
        }
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
                throw new InvalidCredentialsException("Contraseña incorrecta");
            }
            // actualiza la contraseña
            userService.updateUserPassword(userId, dto.getNewPassword());
            System.out.println(dto.getNewPassword());
            

        } catch (Exception e) { 
            System.out.println("Error al cambiar la contraseña: " + e.getMessage());
            throw new RuntimeException("Se ha producido un error al cambiar la contraseña.", e);
        }
    }

}