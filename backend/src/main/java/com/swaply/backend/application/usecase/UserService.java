package com.swaply.backend.application.usecase;


import java.util.List;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.stereotype.Service;

import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.application.mapper.UserMapper;
import com.swaply.backend.domain.model.User;
import com.swaply.backend.domain.repository.UserRepository;

@Service
public class UserService /* implements UserRepository */ {

    private final CosmosTemplate cosmosTemplate;
    private final UserRepository userRepo;
    private final UserMapper userMapper;

    public UserService(CosmosTemplate cosmosTemplate, UserRepository userRepo, UserMapper userMapper) {
        this.cosmosTemplate = cosmosTemplate;
        this.userRepo = userRepo;
        this.userMapper = userMapper;
    }

    public UserDTO createUser(UserDTO dto) {
        User user = new User();
        // Genera un id si no te llega uno (Cosmos exige 'id')
        user.setId(UUID.randomUUID().toString());
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());

        // Opción A: si te basta con persistir (no necesitas el objeto devuelto)
        // cosmosTemplate.upsert(user); // <-- devuelve void

        // Opción B: si quieres la entidad final (e.g. con ETag/Id definitivo)
        String container = cosmosTemplate.getContainerName(User.class);
        User saved = cosmosTemplate.upsertAndReturnEntity(container, user);

        return userMapper.entityToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return StreamSupport
                .stream(cosmosTemplate.findAll(User.class).spliterator(), false)
                .filter(user -> "User".equals(user.getType())) // Filtrar por tipo "User"
                .map(userMapper::entityToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserByEmail(String email) {
        return userMapper.entityToDTO(userRepo.findByEmail(email));
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