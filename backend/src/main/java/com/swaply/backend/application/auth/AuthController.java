package com.swaply.backend.application.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.application.auth.service.AuthService;
import com.swaply.backend.application.auth.dto.LoginDTO;
import com.swaply.backend.application.auth.dto.RegisterDTO;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Classe per rebre el JSON del frontend

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody RegisterDTO dto) {
        UserDTO newUser = service.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    // Esto hay que mirarlo seguramente el Front no deberia tener el código solo un
    // boolean al enviarlo
    @PostMapping("/mailVerify")
    public ResponseEntity<String> mailVerify(@RequestBody String email) {
        String code = service.mailVerify(email);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(code);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO dto) {
        String userID = service.login(dto);
        return ResponseEntity.ok(userID);
    }

}
