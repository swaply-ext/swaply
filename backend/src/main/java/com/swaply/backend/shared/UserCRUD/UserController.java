package com.swaply.backend.shared.UserCRUD;

import com.swaply.backend.shared.UserCRUD.dto.UserDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(@Autowired UserService service) {
        this.service = service;
    }


    @GetMapping
    public ResponseEntity<List<UserDTO>> getAll(@RequestParam(required = false) String contains) {
        if (contains != null){
            contains = contains.replace(" " , "");
            return ResponseEntity.ok(service.findUsersByUsernameContaining(contains));
        }
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(service.getUserByID(id));
    }

    @GetMapping("/{id}/username")
    public ResponseEntity<String> getUsernameById(@PathVariable String id) {
        return ResponseEntity.ok(service.getUsernameById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable String id) {
        service.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserDTO> updatedUser(@PathVariable String id, @RequestBody UserDTO user) {
        UserDTO updatedUser = service.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }

    // La petició se hace a: http://localhost:8081/api/users?email=test@example.com
    // @GetMapping(params = "email")
    // public ResponseEntity<UserDTO> getByEmail(@RequestParam String email) {
    //     return ResponseEntity.ok(service.getUserByEmail(email));
    // }

    // obtener usuarios por ubicación
    @GetMapping("/location/{location}")
    public List<UserDTO> getUsersByLocation(@PathVariable String location) {
        return service.getUsersByLocation(location);
    }

}
//GetMapping de datos profile
