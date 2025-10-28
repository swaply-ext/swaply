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
@RequestMapping("/api/users") //Raíz de los endpoints de User
public class UserController {

    private final UserService service;

    public UserController(@Autowired UserService service) {
        this.service = service;
    }

    // ========== GetMappings ==========
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAll(@RequestParam(required = false) String contains) {
        //if (contains != null){ //Si contiene un parámetro devolverá los usuarios que cumplan ese requisito
        //    contains = contains.replace(" " , ""); //Eliminar espacios en blanco
        //    return ResponseEntity.ok(service.findUsersByUsernameContaining(contains));
        //}
        return ResponseEntity.ok(service.getAllUsers()); //Si NO contiene ningún parámetro, devovlerá todos los usuarios
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(service.getUserByID(id));
    }

    @GetMapping("{/email}}")
    public ResponseEntity<UserDTO> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(service.getUserByEmail(email));
    }

    @GetMapping("/token")
    public ResponseEntity<String> testToken(@RequestHeader("Authorization") String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body("Token no proporcionado");
        }
        return ResponseEntity.ok().body("El token es: " + token);
    }


    // ========== PostMappings ==========
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody RegisterDTO user) {
        UserDTO createdUser = service.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // ========== PatchMappings ==========
    @PatchMapping("/{id}")
    public ResponseEntity<UserDTO> updatedUser(@PathVariable String id, @RequestBody UpdateUserDTO user) {
        UserDTO updatedUser = service.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }

    // ========== DeleteMappings ==========
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable String id) {
        service.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }
}