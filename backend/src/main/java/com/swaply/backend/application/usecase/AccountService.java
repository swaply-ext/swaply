package com.swaply.backend.application.usecase;

import com.azure.cosmos.implementation.User;
import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.application.mapper.LoginMapper;
import com.swaply.backend.application.mapper.RegisterMapper;
import com.swaply.backend.domain.model.Login;
import com.swaply.backend.domain.model.Register;
import com.swaply.backend.domain.repository.UserRepository;


import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AccountService /* implements UserRepository */ {

    private final CosmosTemplate cosmosTemplate;
    private final UserRepository userRepo;

    public AccountService(CosmosTemplate cosmosTemplate, UserRepository userRepo) {
        this.cosmosTemplate = cosmosTemplate;
        this.userRepo = userRepo;

    }



    public RegisterDTO register(RegisterDTO dto) {
        Register entity = RegisterMapper.toEntity(dto);
        entity.setId(UUID.randomUUID().toString());
        entity.setEmail(dto.getEmail());
        entity.setPassword(dto.getPassword());
        System.out.println("Recibido email: " + entity.getEmail());

        Register saved = cosmosTemplate.upsertAndReturnEntity(
        cosmosTemplate.getContainerName(Register.class),
        entity
    );
    return RegisterMapper.toDTO(saved);
}


    public ResponseEntity<Boolean> login(LoginDTO dto) {
        Login entity = LoginMapper.toEntity(dto);
        entity.setEmail(dto.getEmail());
        entity.setPassword(dto.getPassword());
        String email = entity.getEmail();
        String password = entity.getPassword();

        System.out.println("Email: " + email + " Password: " + password);
        return ResponseEntity.ok(true);

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
