package com.swaply.backend.application.usecase;

import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RecoveryPasswordDTO;
import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.application.mapper.RegisterMapper;
import com.swaply.backend.application.mapper.UserMapper;
import com.swaply.backend.domain.model.Register;
import com.swaply.backend.domain.model.User;
import com.swaply.backend.domain.repository.AccountRepository;
import com.swaply.backend.application.mapper.RecoveryPasswordMapper;
import com.swaply.backend.application.dto.RecoveryCodeResponseDTO;

import org.apache.qpid.proton.codec.BooleanType.BooleanEncoding;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.UUID;

@Service
public class AccountService /* implements UserRepository */ {

    private final CosmosTemplate cosmosTemplate;
    private final AccountRepository accountRepo;
    private final UserService userService; //
    private final MailService mailService;
    private final RegisterMapper registerMapper;
    private final PasswordService passwordService;

    @Autowired
    public AccountService(CosmosTemplate cosmosTemplate, AccountRepository accountRepo, UserService userService,
            MailService mailService, RegisterMapper registerMapper, PasswordService passwordService) {
        this.cosmosTemplate = cosmosTemplate;
        this.accountRepo = accountRepo;
        this.userService = userService;
        this.mailService = mailService;
        this.registerMapper = registerMapper;
        this.passwordService = passwordService;

    }

    public String mailVerify(String email) {

        if (userService.existsByEmail(email)) {
            System.out.println("Correo ya registrado");
            throw new RuntimeException("Correo ya registrado");

        }

        Random random = new Random();
        int codeInt = 100000 + random.nextInt(900000); // Asegura que sea de 6 dígitos
        String codeString = Integer.toString(codeInt);

        mailService.sendMessage(email, codeString);

        return codeString;
    }

    public ResponseEntity<RecoveryCodeResponseDTO> recoveryCode(String email) {

        if (!isEmailRegistered(email)) {
            System.out.println("Correo no registrado");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        UserDTO user = userService.getUserByEmail(email);
        String userId = user.getId();
        Random random = new Random();
        int codeInt = 100000 + random.nextInt(900000); // Asegura que sea de 6 dígitos
        String codeString = Integer.toString(codeInt);

        mailService.sendMessage(email, codeString);

        RecoveryCodeResponseDTO response = new RecoveryCodeResponseDTO(userId, codeString);
        return ResponseEntity.ok(response);

    }

    public ResponseEntity<Boolean> recoveryPassword(String newPassword, String Id) {
        UserDTO dto = new UserDTO();

        PasswordService passwordService = new PasswordService();
        newPassword = passwordService.hash(newPassword);
        dto.setPassword(newPassword);
        userService.updateUser(Id, dto);

        return ResponseEntity.ok(true);
    }

    public RegisterDTO register(RegisterDTO dto) {

        // 1) Mapear DTO -> Entity (type="user", id ignorado)
        Register entity = registerMapper.toEntity(dto);
        
        // 2) Asignar ID aquí (no en el mapper)
        entity.setId(UUID.randomUUID().toString());

        // 3) Hashear password aquí (no en el mapper)
        String hash = passwordService.hash(dto.getPassword());
        entity.setPassword(hash);

        // 4) Upsert en Cosmos
        Register saved = cosmosTemplate.upsertAndReturnEntity(
                cosmosTemplate.getContainerName(Register.class),
                entity);

        // 5) Devolver DTO
        return registerMapper.toDTO(saved);
    }

    public String login(LoginDTO dto) {
        String formEmail = dto.getEmail();
        String formPassword = dto.getPassword();

        UserDTO user = userService.getUserByEmail(formEmail);
        String hash = user.getPassword();

        if (passwordService.match(formPassword, hash)) {
            System.out.println("Login correcto");
            System.out.println(user.getId());
            return user.getId();
        }

        System.out.println("Contraseña incorrecta");
        throw new RuntimeException("Contraseña incorrecta");

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