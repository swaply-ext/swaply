package com.swaply.backend.application.usecase;

import com.swaply.backend.domain.model.User;
import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.domain.repository.UserInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.StreamSupport;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserInterface repo;

    public UserService(UserInterface repo) {
        this.repo = repo;
    }

    public UserDTO createUser(UserDTO dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());

        User saved = repo.save(user);
        return new UserDTO(saved.getUsername(), saved.getEmail());
    }
    
    public List<UserDTO> getAllUsers() {
        return StreamSupport.stream(repo.findAll().spliterator(), false)
        .map(u -> new UserDTO(u.getUsername(), u.getEmail()))
        .collect(Collectors.toList());
    }
    // return repo.findAll()
    //         .stream()
    //         .map(u -> new UserDTO(u.getName(), u.getEmail()))
    //         .collect(Collectors.toList());

    // public List<User> getAll() {
    //     // Convertimos el Iterable<User> que devuelve repo.findAll() en un Stream secuencial
    //     return StreamSupport.stream(repo.findAll().spliterator(), false)
        
    //         // Filtramos los usuarios cuyo campo 'id' sea exactamente igual a "User"
    //         .filter(user -> "User".equals(user.getId()))
            
    //         // Recolectamos los elementos filtrados en una lista y la devolvemos
    //         .collect(Collectors.toList());
    // }

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
}