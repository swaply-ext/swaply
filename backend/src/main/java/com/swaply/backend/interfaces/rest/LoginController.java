package com.swaply.backend.interfaces.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swaply.backend.application.usecase.UserService;
import com.swaply.backend.domain.model.Login;
import com.swaply.backend.interfaces.rest.LoginController.LoginRequest;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.application.mapper.LoginMapper;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/login")
public class LoginController {

    public static class LoginRequest {
        private List<LoginDTO> users;

        public List<LoginDTO> getUsers() {
            return users;
        }

        public void setUsers(List<LoginDTO> users) {
            this.users = users;
        }
    }

    private final UserService service;

    public LoginController(@Autowired UserService service) {
        this.service = service;
    }

    @PostMapping("/check")
    public ResponseEntity<List<LoginDTO>> guardarRegister(@RequestBody LoginRequest request) {

        // Ya no habrá NPE: la lista está validada e inicializada.
        List<LoginDTO> creados = new ArrayList<>();
        for (LoginDTO user : request.getUsers()) {
            // ⚠️ No loguees contraseñas en real
            LoginDTO creado = service.login(user);
            creados.add(creado);
        }

        System.out.println(creados.get(0).getEmail());
        System.out.println(creados.get(0).getPassword());


        return ResponseEntity.status(HttpStatus.CREATED).body(creados);
    }

}
