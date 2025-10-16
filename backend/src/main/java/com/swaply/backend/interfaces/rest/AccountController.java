package com.swaply.backend.interfaces.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swaply.backend.application.usecase.AccountService;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RecoveryCodeResponseDTO;
import com.swaply.backend.application.dto.RecoveryPasswordDTO;
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
    public ResponseEntity register(@RequestBody RegisterDTO dto) {
        return ResponseEntity.ok(service.register(dto));
    }

    @PostMapping("/recoveryCode")
    public ResponseEntity<RecoveryCodeResponseDTO> recoveryCode(@RequestBody String email) {
        return service.recoveryCode(email);
    }

    @PostMapping("/recoveryPassword")
    public ResponseEntity<Boolean> recoveryPassword(@RequestBody String newPassword, String Id) {
        return service.recoveryPassword(newPassword, Id);
    }

    @PostMapping("/mailVerify")
    public ResponseEntity<String> mailVerify(@RequestBody String email) {
        return service.mailVerify(email);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO dto) {
        try {
            String userID = service.login(dto);
            return ResponseEntity.ok(userID);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mail o password incorrectos.");

        }
    }

    @GetMapping("/test")
    public ResponseEntity<Boolean> test() {
        service.recoveryPassword("P@ssw0rd", "USR-001");
        return ResponseEntity.ok(true);
    }

}
