package com.swaply.backend.interfaces.rest;

import com.swaply.backend.application.usecase.UserService;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(@Autowired UserService service) {
        this.service = service;
    }

    @PostMapping("/new")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO user) {
        return ResponseEntity.ok(service.createUser(user));
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<UserDTO>> getAll() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/getUserById/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(service.getUserByID(id));
    }

    @DeleteMapping("/deleteUserById/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable String id) {
        try {
            service.deleteUserById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<UserDTO> updatedUser(@PathVariable String id, @RequestBody UserDTO user) {
        try {
            UserDTO updatedUser = service.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
    @GetMapping("/getByEmail/{email}")
    public ResponseEntity<UserDTO> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(service.getUserByEmail(email));
    }


    // @GetMapping("/{id}")
    // public Optional<UserDTO> obtenerPorId(@PathVariable String id) {
    // return service.obtenerPorId(id);
    // }

    // @PutMapping("/{id}")
    // public UserDTO actualizarUsuario(@PathVariable String id, @RequestBody
    // UserDTO userActualizado) {
    // return service.actualizarUsuario(id, userActualizado);
    // }

    // @DeleteMapping("/{id}")
    // public void eliminarUsuario(@PathVariable String id) {
    // service.eliminarUsuario(id);
    // }
}
