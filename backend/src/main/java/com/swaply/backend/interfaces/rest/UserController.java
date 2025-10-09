package com.swaply.backend.interfaces.rest;

import com.swaply.backend.application.usecase.UserService;
import com.swaply.backend.application.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;


import java.util.List;

@RestController
//Prefijo que van a llevar todos los endpoints - Lucas
@RequestMapping("/api/users") 
public class UserController {

    private final UserService service;
    public UserController(@Autowired UserService service) {
        this.service = service;
    }

    /*Las peticiones del tipo Post se utilizan para crear objetos en la BBDD 
      ResponseEntity<Tipo_De_Objeto_Que_Quieras> se utiliza para personalizar los códigos de respuestas que nos devuelve el servidor - Lucas */
    @PostMapping("/new")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO user) {
        return ResponseEntity.ok(service.createUser(user));
    }

    //Las peticiones del tipo Get se utilizan para recibir objetos en la BBDD - Lucas
    @GetMapping("/getAll")
    public ResponseEntity<List<UserDTO>> getAll() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/getUserById/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(service.getUserByID(id));
    }



    // @GetMapping("/{id}")
    // public Optional<UserDTO> obtenerPorId(@PathVariable String id) {
    //     return service.obtenerPorId(id);
    // }

    // @PutMapping("/{id}")
    // public UserDTO actualizarUsuario(@PathVariable String id, @RequestBody UserDTO userActualizado) {
    //     return service.actualizarUsuario(id, userActualizado);
    // }

    // @DeleteMapping("/{id}")
    // public void eliminarUsuario(@PathVariable String id) {
    //     service.eliminarUsuario(id);
    // }
}