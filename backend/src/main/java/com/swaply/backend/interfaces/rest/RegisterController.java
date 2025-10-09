package com.swaply.backend.interfaces.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swaply.backend.application.usecase.AccountService;
import com.swaply.backend.application.dto.RegisterDTO;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/register")
public class RegisterController {

    // Classe per rebre el JSON del frontend
    public static class RegisterRequest {
        private List<RegisterDTO> users;

        public List<RegisterDTO> getUsers() {
            return users;
        }

        public void setUsers(List<RegisterDTO> users) {
            this.users = users;
        }
    }

    private final AccountService service;

    public RegisterController(@Autowired AccountService service) {
        this.service = service;
    }

    // @PostMapping("/new")
    // public ResponseEntity<RegisterDTO> createUser(@RequestBody RegisterDTO user)
    // {
    // return ResponseEntity.ok(service.register(user));
    // }
    @PostMapping("/save")
    public ResponseEntity<List<RegisterDTO>> guardarRegister(@RequestBody RegisterRequest request) {

        // Ya no habrá NPE: la lista está validada e inicializada.
        List<RegisterDTO> creados = new ArrayList<>();
        for (RegisterDTO user : request.getUsers()) {
            // ⚠️ No loguees contraseñas en real
            RegisterDTO creado = service.register(user);
            creados.add(creado);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(creados);
    }

}
