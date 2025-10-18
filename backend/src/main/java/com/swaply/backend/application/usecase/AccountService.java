package com.swaply.backend.application.usecase;

import java.util.Random;
import java.util.UUID;

import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.domain.model.User;
import com.swaply.backend.domain.repository.UserRepository;

import com.swaply.backend.application.exception.InvalidCredentialsException;
import com.swaply.backend.application.exception.UserAlreadyExistsException;
import com.swaply.backend.application.exception.UserNotFoundException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AccountService /* implements UserRepository */ {

    private final UserRepository userRepository;

    private final UserService userService; //
    private final MailService mailService;
    private final PasswordService passwordService;
    private final JwtService jwtService;

    @Value("${frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

    public AccountService(UserService userService,
            MailService mailService, PasswordService passwordService,
            JwtService jwtService, UserRepository userRepository) {
        this.userService = userService;
        this.mailService = mailService;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    // Falta revision de que no exista el nombre de usuario
    public UserDTO register(RegisterDTO dto) {
        if (userService.existsByEmail(dto.getEmail())) {
            throw new UserAlreadyExistsException("El email: " + dto.getEmail() + " ya esta en uso.");
        }
        return userService.createUser(dto);
    }

    // Devuelve 401 si la contraseña es incorrecta pero 404 si es el mail que no
    // existe a causa de "userService.getUserByEmail" hay que revisar
    public String login(LoginDTO dto) {
        String formEmail = dto.getEmail();
        String formPassword = dto.getPassword();

        UserDTO user = userService.getUserByEmail(formEmail);

        if (passwordService.match(formPassword, user.getPassword())) {
            System.out.println("Login correcto");
            System.out.println(user.getId());
            return user.getId();
        } else {
            System.out.println("Contraseña incorrecta");
            throw new InvalidCredentialsException("Contraseña incorrecta");
        }
    }

    public String mailVerify(String email) {

        if (userService.existsByEmail(email)) {
            System.out.println("Correo ya registrado");
            throw new UserAlreadyExistsException("Correo ya registrado");

        }

        Random random = new Random();
        int codeInt = 100000 + random.nextInt(900000); // Asegura que sea de 6 dígitos
        String codeString = Integer.toString(codeInt);

        mailService.sendMessage(email, codeString);

        return codeString;
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