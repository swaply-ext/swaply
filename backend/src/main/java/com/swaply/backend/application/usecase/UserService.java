package com.swaply.backend.application.usecase;

import com.swaply.backend.domain.model.User;
import com.swaply.backend.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.StreamSupport;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    public User crearUsuario(User user) {
        return repo.save(user);
    }



    public List<User> obtenerTodos() {
        // Convertimos el Iterable<User> que devuelve repo.findAll() en un Stream secuencial
        return StreamSupport.stream(repo.findAll().spliterator(), false)
        
            // Filtramos los usuarios cuyo campo 'id' sea exactamente igual a "User"
            .filter(user -> "User".equals(user.getId()))
            
            // Recolectamos los elementos filtrados en una lista y la devolvemos
            .collect(Collectors.toList());
    }




    public Optional<User> obtenerPorId(String id) {
        return repo.findById(id);
    }

    public User actualizarUsuario(String id, User userActualizado) {
        userActualizado.setId(id);
        return repo.save(userActualizado);
    }

    public void eliminarUsuario(String id) {
        repo.deleteById(id);
    }
}
