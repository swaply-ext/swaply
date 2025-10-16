package com.swaply.backend.application.usecase;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import java.lang.reflect.Method;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        String container = cosmosTemplate.getContainerName(User.class);
        User saved = cosmosTemplate.upsertAndReturnEntity(container, userMapper.dtoToEntity(dto));
        return dto;
    }

    public List<UserDTO> getAllUsers() {
        return StreamSupport
                .stream(cosmosTemplate.findAll(User.class).spliterator(), false)
                .filter(user -> "user".equals(user.getType())) // Filtrar por tipo "user"
                .map(userMapper::entityToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepo.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return userMapper.entityToDTO(user);

    }

    public UserDTO getUserByID(String id) {
        return userMapper.entityToDTO(userRepo.findById(id).orElse(null));
    }

    public UserDTO tryToGetUserById(String id) {
        if (!isUserExisting(id)) {
            return null;
        }
        return getUserByID(id);
    }

    public boolean isUserExisting(String id) {// método para controlar nulls
        try {
            getUserByID(id);
        } catch (NullPointerException e) {
            return false;
        }
        return true;
    }

    public void deleteUserById(String id) {
        User user = userRepo.findById(id).orElse(null);
        if (user != null) {
            userRepo.delete(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    @Transactional
    public UserDTO updateUser(String id, UserDTO dto) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // Copia solo propiedades NO nulas desde el DTO sobre la entidad existente
        userMapper.updateUserFromDto(dto, user);

        user = userRepo.save(user);
        return userMapper.entityToDTO(user);
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
