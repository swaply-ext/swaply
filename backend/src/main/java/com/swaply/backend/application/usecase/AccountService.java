package com.swaply.backend.application.usecase;

import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RecoveryPasswordDTO;
import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.application.mapper.LoginMapper;
import com.swaply.backend.application.mapper.RegisterMapper;
import com.swaply.backend.application.mapper.UserMapper;
import com.swaply.backend.domain.model.Login;
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


    @Autowired
    public AccountService(CosmosTemplate cosmosTemplate, AccountRepository accountRepo, UserService userService,
            MailService mailService, RegisterMapper registerMapper) {
        this.cosmosTemplate = cosmosTemplate;
        this.accountRepo = accountRepo;
        this.userService = userService;
        this.mailService = mailService;
        this.registerMapper = registerMapper;
    }

    public ResponseEntity<String> mailVerify(String email) {

        if (isEmailRegistered(email)) {
            System.out.println("Correo ya registrado");
            return ResponseEntity.ok("false");

        }

        Random random = new Random();
        int codeInt = 100000 + random.nextInt(900000); // Asegura que sea de 6 dígitos
        String codeString = Integer.toString(codeInt);

        mailService.sendMessage(email, codeString);

        return ResponseEntity.ok(codeString);
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

        PasswordService passwordService = new PasswordService();
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

    public ResponseEntity<String> login(LoginDTO dto) {
        Login entity = LoginMapper.toEntity(dto);
        String formEmail = entity.getEmail();
        String formPassword = entity.getPassword();
        PasswordService passwordService = new PasswordService();

        if (isEmailRegistered(formEmail) == false) {
            System.out.println("Correo no registrado");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);

        }

        UserDTO user = userService.getUserByEmail(formEmail);
        String hash = user.getPassword();
        String userId = user.getId();

        if (passwordService.match(formPassword, hash)) {
            System.out.println("Login correcto");
            System.out.println(userId);
            return ResponseEntity.ok(userId);
        }

        System.out.println("Contraseña incorrecta");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);

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