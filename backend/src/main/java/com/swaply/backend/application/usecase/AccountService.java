package com.swaply.backend.application.usecase;

import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.application.mapper.LoginMapper;
import com.swaply.backend.application.mapper.RegisterMapper;
import com.swaply.backend.domain.model.Login;
import com.swaply.backend.domain.model.Register;
import com.swaply.backend.domain.repository.AccountRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.UUID;

@Service
public class AccountService /* implements UserRepository */ {

    private final CosmosTemplate cosmosTemplate;
    private final AccountRepository accountRepo;
    private final UserService userService; //

    @Autowired
    public AccountService(CosmosTemplate cosmosTemplate, AccountRepository accountRepo, UserService userService) {
        this.cosmosTemplate = cosmosTemplate;
        this.accountRepo = accountRepo;
        this.userService = userService;

    }

    public ResponseEntity<String> mailVerify(String email) {

        if (isEmailRegistered(email)) {
        System.out.println("Correo ya registrado");
        return ResponseEntity.ok("0");

        }

        Random random = new Random();
        int codeInt = 100000 + random.nextInt(900000); // Asegura que sea de 6 dígitos
        String codeString = Integer.toString(codeInt);

        return ResponseEntity.ok(codeString);
    }

    public ResponseEntity<String> recoveryPassword(String email) {

        if (!isEmailRegistered(email)) {
        System.out.println("Correo no registrado");
        return ResponseEntity.ok("0");
        }

        Random random = new Random();
        int codeInt = 100000 + random.nextInt(900000); // Asegura que sea de 6 dígitos
        String codeString = Integer.toString(codeInt);

        return ResponseEntity.ok(codeString);
    }

    public RegisterDTO register(RegisterDTO dto) {
        Register entity = RegisterMapper.toEntity(dto);
        entity.setId(UUID.randomUUID().toString());
        String hash = new PasswordService().hash(entity.getPasswordHash());
        entity.setPasswordHash(hash);

        Register saved = cosmosTemplate.upsertAndReturnEntity(
                cosmosTemplate.getContainerName(Register.class),
                entity);
        return RegisterMapper.toDTO(saved);
    }

    public ResponseEntity<Boolean> login(LoginDTO dto) {
        Login entity = LoginMapper.toEntity(dto);
        String formEmail = entity.getEmail();
        String formPassword = entity.getPassword();
        PasswordService passwordService = new PasswordService();

        if (isEmailRegistered(formEmail) == false) {
            System.out.println("Correo no registrado");
            return ResponseEntity.ok(false);

        }

        UserDTO user = userService.getUserByEmail(formEmail);
        String hash = user.getPasswordHash();

        if (passwordService.match(formPassword, hash)) {
            System.out.println("Login correcto");
            return ResponseEntity.ok(true);
        }

        System.out.println("Contraseña incorrecta");
        return ResponseEntity.ok(false);

    }

    public boolean isEmailRegistered(String email) {
        try {
            userService.getUserByEmail(email);
        } catch (NullPointerException e) {
            return false;
        }
        return true;
    }

}