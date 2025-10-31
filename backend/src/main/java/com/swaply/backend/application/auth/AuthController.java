package com.swaply.backend.application.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.application.auth.service.AuthService;
import com.swaply.backend.application.auth.dto.LoginDTO;
import com.swaply.backend.application.auth.dto.RegisterActivationDTO;
import com.swaply.backend.application.auth.dto.RegisterDTO;
import com.swaply.backend.application.auth.dto.RegisterInitialDTO;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Classe per rebre el JSON del frontend

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody RegisterInitialDTO dto) {
        UserDTO newUser = service.initialRegister(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }


    @PostMapping("/registerCodeVerify")
    public ResponseEntity<String> registerCodeVerify(@RequestBody RegisterActivationDTO dto) {
        String token = service.registerCodeVerify(dto);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(token);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO dto) {
        String token = service.login(dto);
        return ResponseEntity.ok(token);
    }

}
