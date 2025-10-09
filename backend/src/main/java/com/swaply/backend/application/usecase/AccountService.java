package com.swaply.backend.application.usecase;

import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.application.mapper.LoginMapper;
import com.swaply.backend.application.mapper.RegisterMapper;
import com.swaply.backend.domain.model.Login;
import com.swaply.backend.domain.model.Register;
import com.swaply.backend.domain.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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
        // Genera un id si no te llega uno (Cosmos exige 'id')
        entity.setId(UUID.randomUUID().toString());
        entity.setEmail(dto.getEmail());
        entity.setType("user");
        entity.setPassword(dto.getPassword());

        // Opción A: si te basta con persistir (no necesitas el objeto devuelto)
        // cosmosTemplate.upsert(user); // <-- devuelve void

        // Opción B: si quieres la entidad final (e.g. con ETag/Id definitivo)
        String container = cosmosTemplate.getContainerName(Register.class);
        Register saved = cosmosTemplate.upsertAndReturnEntity(container, entity);
        return RegisterMapper.toDTO(entity);
    }

    public LoginDTO login(LoginDTO dto) {
        Login entity = LoginMapper.toEntity(dto);
        entity.setEmail(dto.getEmail());
        entity.setPassword(dto.getPassword());

        return dto;

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
