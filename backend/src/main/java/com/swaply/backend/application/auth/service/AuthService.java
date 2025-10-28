package com.swaply.backend.application.auth.service;

import java.util.Random;

import com.swaply.backend.application.auth.dto.LoginDTO;
import com.swaply.backend.application.auth.dto.RegisterDTO;
import com.swaply.backend.application.auth.exception.InvalidCredentialsException;
import com.swaply.backend.application.auth.exception.UserAlreadyExistsException;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;
import com.swaply.backend.shared.mail.MailService;
import com.swaply.backend.shared.token.JwtService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AuthService {

    private final UserService userService; //
    private final MailService mailService;
    private final PasswordService passwordService;
    private final JwtService jwtService;

    public AuthService(UserService userService,
            MailService mailService, PasswordService passwordService,
            JwtService jwtService) {
        this.userService = userService;
        this.mailService = mailService;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
    }

    public Object login(LoginDTO dto) {
        String formEmail = dto.getEmail();
        String formPassword = dto.getPassword();

        UserDTO user;

        try {
            user = userService.getUserByEmail(formEmail);
        } catch (UserNotFoundException e) {
            throw new InvalidCredentialsException("Correo no registrado");
        }

        if (passwordService.match(formPassword, user.getPassword())) {
            System.out.println("Login correcto");
            System.out.println(user.getId());
            String token = jwtService.generateIdToken(user.getId());
            System.out.println(token);
            return token;
        } else {
            System.out.println("Contraseña incorrecta");
            throw new InvalidCredentialsException("Contraseña incorrecta");
        }
    }

    public UserDTO register(RegisterDTO dto) {
        if (userService.existsByEmail(dto.getEmail())) {
            throw new UserAlreadyExistsException("El email: " + dto.getEmail() + " ya esta en uso.");
        }
        return userService.createUser(dto);
    }

    public String mailVerify(String email) {

        if (userService.existsByEmail(email)) {
            System.out.println("Correo ya registrado");
            throw new UserAlreadyExistsException("Correo ya registrado");

        }

        Random random = new Random();
        int codeInt = 100000 + random.nextInt(900000); // Asegura que sea de 6 dígitos
        String codeString = Integer.toString(codeInt);

        mailService.sendVerificationCode(email, codeString);

        return codeString;
    }

}