package com.swaply.backend.interfaces.rest;

import com.swaply.backend.application.usecase.UserService;
import com.swaply.backend.domain.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService service;

    @PostMapping("/nuevo")
    public User crearUsuario(@RequestBody User user) {
        return service.crearUsuario(user);
    }

    @GetMapping("/obtenertodos")
    public List<User> obtenerTodos() {
        return service.obtenerTodos();
    }

    @GetMapping("/{id}")
    public Optional<User> obtenerPorId(@PathVariable String id) {
        return service.obtenerPorId(id);
    }

    @PutMapping("/{id}")
    public User actualizarUsuario(@PathVariable String id, @RequestBody User userActualizado) {
        return service.actualizarUsuario(id, userActualizado);
    }

    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable String id) {
        service.eliminarUsuario(id);
    }
}
