package com.swaply.backend.interfaces.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swaply.backend.application.usecase.AccountService;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.application.dto.UserDTO;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    // Classe per rebre el JSON del frontend

    private final AccountService service;

    public AccountController(@Autowired AccountService service) {
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

    @PostMapping("/recoveryCode")
    public ResponseEntity<String> generateAndSendResetLink(@RequestBody String email) {
        service.generateAndSendResetLink(email);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("Código generado y enviado si el mail existe");

    }

    @PostMapping("/passwordReset")
    public ResponseEntity<Boolean> resetPassword(@RequestBody String token, String newPassword) {
        service.resetPassword(token, newPassword);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(true);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO dto) {
            String userID = service.login(dto);
            return ResponseEntity.ok(userID);
    }

}
