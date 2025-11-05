package com.swaply.backend.application.auth.service;

import java.util.Random;

import com.swaply.backend.application.auth.AuthMapper;
import com.swaply.backend.application.auth.dto.LoginDTO;
import com.swaply.backend.application.auth.dto.RegisterActivationDTO;
import com.swaply.backend.application.auth.dto.RegisterInitialDTO;
import com.swaply.backend.application.auth.exception.InvalidCredentialsException;
import com.swaply.backend.application.auth.exception.UserAlreadyExistsException;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;
import com.swaply.backend.shared.mail.MailService;
import com.swaply.backend.shared.token.JwtService;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService; //
    private final MailService mailService;
    private final PasswordService passwordService;
    private final JwtService jwtService;
    private final AuthMapper mapper;

    public AuthService(UserService userService,
            MailService mailService, PasswordService passwordService,
            JwtService jwtService, AuthMapper mapper) {
        this.userService = userService;
        this.mailService = mailService;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
        this.mapper = mapper;
    }

    public String login(LoginDTO dto) {
        String formEmail = dto.getEmail();
        String formPassword = dto.getPassword();

        UserDTO user;

        try {
            user = userService.getUserByEmail(formEmail);
        } catch (UserNotFoundException e) {
            throw new InvalidCredentialsException("Correo no registrado");
        }

        if (passwordService.match(formPassword, user.getPassword())) {
            String token = jwtService.generateSessionToken(user.getId());
            return token;
        } else {
            throw new InvalidCredentialsException("Contraseña incorrecta");
        }
    }

    public UserDTO initialRegister(RegisterInitialDTO dto) {
        if (userService.existsByEmail(dto.getEmail())) {
            throw new UserAlreadyExistsException("El email: " + dto.getEmail() + " ya esta en uso.");
        }
        if (userService.existsByUsername(dto.getUsername())) {
            throw new UserAlreadyExistsException("El usuario: " + dto.getUsername() + " ya esta en uso.");
        }

        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Asegura que sea de 6 dígitos
        // String codeString = Integer.toString(code);

        mailService.sendVerificationCode(dto.getEmail(), code);
        dto.setCode(code);

        UserDTO newUser = mapper.fromRegisterDTO(dto);
        return userService.createUser(newUser);
    }

    public String completeRegistration(RegisterActivationDTO dto) {

        UserDTO user = userService.getUserByEmail(dto.getEmail());

        if (user.getCode() != null && user.getCode().equals(dto.getCode())) {

            user.setCode(-1);
            user.setTtl(-1);

            userService.updateUser(user.getId(), user);

            return jwtService.generateSessionToken(user.getId());
        } else {
            throw new InvalidCredentialsException("El código de verificación es incorrecto.");
        }

    }

}
