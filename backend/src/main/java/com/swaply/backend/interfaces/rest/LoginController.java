package com.swaply.backend.interfaces.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swaply.backend.application.usecase.UserService;
import com.swaply.backend.domain.model.Login;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RegisterDTO;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/login")
public class LoginController {

    public static class LoginRequest {
        private LoginDTO user;

        public LoginDTO getUsers() {
            return user;
        }

        public void setUsers(LoginDTO user) {
            this.user = user;
        }
    }

    private final UserService service;

    public LoginController(@Autowired UserService service) {
        this.service = service;
    }

    @PostMapping("/check")
    public ResponseEntity<Boolean> checkLogin(@RequestBody LoginRequest request) {
        
        LoginDTO user = request.getUsers();

        if (user == null) {
            System.out.println("LoginDTO es null");
        } else {
            System.out.println("LoginDTO recibido:");
            System.out.println("Email: " + user.getEmail());
            System.out.println("Password: " + user.getPassword());
            System.out.println("Terms: " + user.getAcceptedTerms());
        }
        return ResponseEntity.ok(true);
    }

}
