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

    public ResponseEntity<Integer> code(String email) {
        // if (email in){
        // return ResponseEntity.ok(0);
        // }
        Random random = new Random();
        int codigo = 100000 + random.nextInt(900000); // Asegura que sea de 6 dígitos
        return ResponseEntity.ok(codigo);
    }

    public RegisterDTO register(RegisterDTO dto) {
        Register entity = RegisterMapper.toEntity(dto);
        entity.setId(UUID.randomUUID().toString());
        System.out.println("Recibido email: " + entity.getEmail());

        Register saved = cosmosTemplate.upsertAndReturnEntity(
                cosmosTemplate.getContainerName(Register.class),
                entity);
        return RegisterMapper.toDTO(saved);
    }

    public ResponseEntity<Boolean> login(LoginDTO dto) {
        Login entity = LoginMapper.toEntity(dto);
        String formEmail = entity.getEmail();
        String formPassword = entity.getPassword();

        try {
            UserDTO user = userService.getUserByEmail(formEmail);

            if (!user.getPasswordHash().equals(formPassword)) {
                System.out.println("Contraseña incorrecta");
                return ResponseEntity.ok(false);
            }

            System.out.println("Login correcto");
            return ResponseEntity.ok(true);

        } catch (NullPointerException e) {
            System.out.println("Correo no registrado");
            return ResponseEntity.ok(false);
        }

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
