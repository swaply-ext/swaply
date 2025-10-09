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
        private LoginDTO users;

        public LoginDTO getUsers() {
            return users;
        }

        public void setUsers(LoginDTO users) {
            this.users = users;
        }
    }

    private final UserService service;

    public LoginController(@Autowired UserService service) {
        this.service = service;
    }

    @PostMapping("/check")
    public ResponseEntity<Boolean> guardarRegister(@RequestBody LoginRequest request) {

        
        
        LoginDTO login = request.getUsers();
        login = service.login(login);
        String email = login.getEmail();
        String password = login.getPassword();

        System.out.println("Email: " + email + " Password: " + password);

        return ResponseEntity.ok(true);
    }

}
