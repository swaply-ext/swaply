package com.swaply.backend.interfaces.rest;

import org.springframework.beans.factory.annotation.Autowired;
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
    public ResponseEntity<RecoveryCodeResponseDTO> recoveryCode(@RequestBody String email, RecoveryPasswordDTO dto) {
        return service.recoveryCode(email, dto);
    }

    @PostMapping("/recoveryPassword")
    public ResponseEntity<Boolean> recoveryPassword(@RequestBody String newPassword, String email, UserDTO dto, String Id) {
        return service.recoveryPassword(newPassword, email, dto, Id);
    }

    @PostMapping("/mailVerify")
    public ResponseEntity<String> mailVerify(@RequestBody String email) {
        return service.mailVerify(email);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO dto) {
        return service.login(dto);
    }

}
