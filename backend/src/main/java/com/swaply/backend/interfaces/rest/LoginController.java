package com.swaply.backend.interfaces.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swaply.backend.application.usecase.AccountService;
import com.swaply.backend.application.dto.LoginDTO;

@RestController
@RequestMapping("/api/login")
public class LoginController {
    private final AccountService service;

    public LoginController(@Autowired AccountService service) {
        this.service = service;
    }

    @PostMapping("/check")
    public ResponseEntity<ResponseEntity<Boolean>> guardarRegister(@RequestBody LoginDTO dto) {
        return ResponseEntity.ok(service.login(dto));
    }

}
