package com.swaply.backend.application.usecase;

import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.application.mapper.UserMapper;
import com.swaply.backend.domain.model.User;
import com.swaply.backend.domain.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService /*implements UserRepository*/ {

    private final CosmosTemplate cosmosTemplate;
    private final UserRepository userRepo;
    private final UserMapper userMapper;

    public UserService(CosmosTemplate cosmosTemplate, UserRepository userRepo, UserMapper userMapper) {
        this.cosmosTemplate = cosmosTemplate;
        this.userRepo = userRepo;
        this.userMapper = userMapper;
    }

    public UserDTO createUser(UserDTO dto) {
        // Genera un id si no te llega uno (Cosmos exige 'id')
        // Opción A: si te basta con persistir (no necesitas el objeto devuelto)
        // cosmosTemplate.upsert(user); // <-- devuelve void

        // Opción B: si quieres la entidad final (e.g. con ETag/Id definitivo)
        String container = cosmosTemplate.getContainerName(User.class);
        User saved = cosmosTemplate.upsertAndReturnEntity(container, userMapper.dtoToEntity(dto));

        return dto;
    }

    public List<UserDTO> getAllUsers() {
        return userRepo.findByType("User") // Encuentra todos los objetos de tipo User en el repo
                .stream() // Crea una secuencia de elementos iterables
                .map(userMapper::entityToDTO) // Convertir cada objeto User a su correspondiente UserDTO usando el método entityToDTO del userMapper
                .collect(Collectors.toList()); // Crea un List<DTO> con todos los objetos 
    }

    public UserDTO getUserByID(String id){
        return userMapper.entityToDTO(userRepo.findById(id).orElse(null)); //Devuelve el usuario cuyo ID coincida
    }

    /*public UserDTO updateUser(UserDTO updateduser){
        
    }*/
}
    // return repo.findAll()
    //         .stream()
    //         .map(u -> new UserDTO(u.getName(), u.getEmail()))
    //         .collect(Collectors.toList());

    // public Optional<User> obtenerPorId(String id) {
    //     return repo.findById(id);
    // }

    // public User actualizarUsuario(String id, User userActualizado) {
    //     userActualizado.setId(id);
    //     return repo.save(userActualizado);
    // }

    // public void eliminarUsuario(String id) {
    //     repo.deleteById(id);
    // }
