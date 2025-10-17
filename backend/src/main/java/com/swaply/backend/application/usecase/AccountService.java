package com.swaply.backend.application.usecase;

import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.application.mapper.RegisterMapper;
import com.swaply.backend.application.mapper.UserMapper;
import com.swaply.backend.domain.model.Register;
import com.swaply.backend.domain.model.User;
import com.swaply.backend.application.dto.RecoveryCodeResponseDTO;
import com.swaply.backend.application.dto.RecoveryPasswordRecieveDTO;

import org.apache.qpid.proton.codec.BooleanType.BooleanEncoding;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.UUID;

import javax.management.RuntimeErrorException;

@Service
public class AccountService /* implements UserRepository */ {

    private final CosmosTemplate cosmosTemplate;
    private final UserService userService; //
    private final MailService mailService;
    private final RegisterMapper registerMapper;
    private final PasswordService passwordService;

    @Autowired
    public AccountService(CosmosTemplate cosmosTemplate, UserService userService,
            MailService mailService, RegisterMapper registerMapper, PasswordService passwordService) {
        this.cosmosTemplate = cosmosTemplate;
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

    public RecoveryCodeResponseDTO recoveryCode(String email) {

            UserDTO user = userService.getUserByEmail(email);
            String userId = user.getId();
            Random random = new Random();
            int codeInt = 100000 + random.nextInt(900000); // Asegura que sea de 6 dígitos
            String codeString = Integer.toString(codeInt);

            mailService.sendMessage(email, codeString);

            RecoveryCodeResponseDTO response = new RecoveryCodeResponseDTO(userId, codeString);
            return response;

    }

    public Boolean recoveryPassword(RecoveryPasswordRecieveDTO dto) {
        UserDTO userDTO = new UserDTO();
        String newPassword = dto.getNewPassword();
        String Id = dto.getUserId();
        newPassword = passwordService.hash(newPassword);
        userDTO.setPassword(newPassword);
        userService.updateUser(Id, userDTO);

        return true;
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