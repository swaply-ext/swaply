package com.swaply.backend.application.usecase;


import java.util.List;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;

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
        String container = cosmosTemplate.getContainerName(User.class);
        User saved = cosmosTemplate.upsertAndReturnEntity(container, userMapper.dtoToEntity(dto));
        return dto;
    }

    public List<UserDTO> getAllUsers() {
        return userRepo.findByType("user")
                .stream()
                .map(userMapper::entityToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserByID(String id) {
        return userMapper.entityToDTO(userRepo.findById(id).orElse(null));
    }

    public void deleteUserById(String id) {
        User user = userRepo.findById(id).orElse(null);
        if (user != null) {
            userRepo.delete(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public UserDTO updateUser(String id, UserDTO dto) {
        User existingUser = userRepo.findById(id).orElse(null);

        if (existingUser == null) {

            throw new RuntimeException("User not found!");

        }

        if (!existingUser.getUsername().equals(dto.getUsername())) {
            existingUser.setUsername(dto.getUsername());
        }

        if (!existingUser.getFullName().equals(dto.getFullName())) {
            existingUser.setFullName(dto.getFullName());
        }

        if (!existingUser.getEmail().equals(dto.getEmail())) {
            existingUser.setEmail(dto.getEmail());
        }

        if (!existingUser.getPasswordHash().equals(dto.getPasswordHash())) {
            existingUser.setPasswordHash(dto.getPasswordHash());
        }

        if (!existingUser.getLocation().equals(dto.getLocation())) {
            existingUser.setLocation(dto.getLocation());
        }

        if (!existingUser.getGender().equals(dto.getGender())) {
            existingUser.setGender(dto.getGender());
        }

        if (existingUser.getAge() != dto.getAge()) {
            existingUser.setAge(dto.getAge());
        }

        if (!existingUser.getDescription().equals(dto.getDescription())) {
            existingUser.setDescription((dto.getDescription()));
        }

        if (!existingUser.getDescription().equals(dto.getDescription())) {
            existingUser.setDescription((dto.getDescription()));
        }

        if (!existingUser.getProfilePhotoUrl().equals(dto.getProfilePhotoUrl())) {
            existingUser.setProfilePhotoUrl((dto.getProfilePhotoUrl()));
        }

        if (existingUser.isVerified() != dto.isVerified()) {
            existingUser.setVerified(dto.isVerified());
        }

        if (existingUser.isPremium() != dto.isPremium()) {
            existingUser.setPremium(dto.isPremium());
        }

        if (existingUser.isModerator() != dto.isModerator()) {
            existingUser.setModerator(dto.isModerator());

        }


        User updatedUser = userRepo.save(existingUser);
        return userMapper.entityToDTO(updatedUser);

    }

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
