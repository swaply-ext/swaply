package com.swaply.backend.interfaces.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swaply.backend.application.usecase.AccountService;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RegisterDTO;

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

    @PostMapping("/verifyCode")
    public ResponseEntity<String> verifyCode(@RequestBody String email) {
        return service.code(email);
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseEntity<Boolean>> login(@RequestBody LoginDTO dto) {
        return ResponseEntity.ok(service.login(dto));
    }

}
