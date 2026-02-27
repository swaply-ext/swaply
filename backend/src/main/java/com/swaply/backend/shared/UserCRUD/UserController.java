package com.swaply.backend.shared.UserCRUD;

import com.swaply.backend.config.security.SecurityUser;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(@Autowired UserService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<List<UserDTO>> getAll() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping(params = "contains")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String contains) {
        return ResponseEntity.ok(service.findUsersByUsernameContaining(contains));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable String id) {
        return ResponseEntity.ok(service.getUserByID(id));
    }

    @GetMapping("/username")
    public ResponseEntity<String> getUsername(
            @RequestParam(required = false) String id,
            @AuthenticationPrincipal SecurityUser principal) {
        // cuando buscamos el username de un id concreto
        if (id != null && !id.trim().isEmpty()) {
            return ResponseEntity.ok(service.getUsernameById(id));
        }
        // cuando buscamos nuestro propio username (id del token)
        if (principal != null) {
            return ResponseEntity.ok(service.getUsernameById(principal.getUsername()));
        }

        return ResponseEntity.status(400).body("Debes proporcionar un 'id' o estar logueado.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR') or #id == authentication.principal.username")
    public ResponseEntity<Void> deleteUserById(@PathVariable String id) {
        service.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR') or #id == authentication.principal.username")
    public ResponseEntity<UserDTO> updatedUser(@PathVariable String id, @RequestBody UserDTO user) {
        UserDTO updatedUser = service.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }

    // La petició se hace a: http://localhost:8081/api/users?email=test@example.com
    // @GetMapping(params = "email")
    // public ResponseEntity<UserDTO> getByEmail(@RequestParam String email) {
    // return ResponseEntity.ok(service.getUserByEmail(email));
    // }

    // // obtener usuarios por ubicación
    // @GetMapping("/location/{location}")
    // public List<UserDTO> getUsersByLocation(@PathVariable String location) {
    // return service.getUsersByLocation(location);
    // }

}
// GetMapping de datos profile
