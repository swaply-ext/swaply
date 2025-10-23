package com.swaply.backend.shared.UserCRUD;

import com.swaply.backend.application.auth.dto.RegisterDTO;
import com.swaply.backend.shared.UserCRUD.dto.UpdateUserDTO;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;

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

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody RegisterDTO user) {
        UserDTO createdUser = service.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAll() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(service.getUserByID(id));
    }

    // Porque se retorna noContent?
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable String id) {
        service.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserDTO> updatedUser(@PathVariable String id, @RequestBody UpdateUserDTO user) {
        UserDTO updatedUser = service.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }

    /* La petició se hace a: http://localhost:8081/api/users/email?email= */
    @GetMapping(params = "email")
    public ResponseEntity<UserDTO> getByEmail(@RequestParam String email) {
        return ResponseEntity.ok(service.getUserByEmail(email));
    }

}
