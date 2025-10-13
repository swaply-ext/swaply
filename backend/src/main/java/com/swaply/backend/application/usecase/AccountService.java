package com.swaply.backend.application.usecase;

import com.azure.cosmos.implementation.User;
import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.application.mapper.LoginMapper;
import com.swaply.backend.application.mapper.RegisterMapper;
import com.swaply.backend.domain.model.Login;
import com.swaply.backend.domain.model.Register;
import com.swaply.backend.domain.repository.AccountRepository;
import com.swaply.backend.domain.repository.UserRepository;
import com.swaply.backend.interfaces.rest.UserController;

import org.apache.qpid.proton.codec.messaging.SourceType;
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

    public ResponseEntity<String> code(String email) {
        // if (email in){
        // return ResponseEntity.ok(0);
        // }
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


        try {
            UserDTO user = userService.getUserByEmail(formEmail);

            String hash = user.getPasswordHash();

            if (passwordService.match(formPassword, hash)) {
                System.out.println("Login correcto");
                return ResponseEntity.ok(true);
            }

            System.out.println("Contraseña incorrecta");
            return ResponseEntity.ok(false);

        } catch (NullPointerException e) {
            System.out.println("Correo no registrado");
            return ResponseEntity.ok(false);
        }

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
// return repo.findAll()
// .stream()
// .map(u -> new UserDTO(u.getName(), u.getEmail()))
// .collect(Collectors.toList());

// public List<User> getAll() {
// // Convertimos el Iterable<User> que devuelve repo.findAll() en un Stream
// secuencial
// return StreamSupport.stream(repo.findAll().spliterator(), false)

// // Filtramos los usuarios cuyo campo 'id' sea exactamente igual a "User"
// .filter(user -> "User".equals(user.getId()))

// // Recolectamos los elementos filtrados en una lista y la devolvemos
// .collect(Collectors.toList());
// }

// public Optional<User> obtenerPorId(String id) {
// return repo.findById(id);
// }

// public User actualizarUsuario(String id, User userActualizado) {
// userActualizado.setId(id);
// return repo.save(userActualizado);
// }

// public void eliminarUsuario(String id) {
// repo.deleteById(id);
// }
