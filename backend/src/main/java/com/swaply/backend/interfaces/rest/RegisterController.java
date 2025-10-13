package com.swaply.backend.interfaces.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swaply.backend.application.usecase.AccountService;
import com.azure.security.keyvault.jca.implementation.shaded.org.apache.hc.core5.http.HttpStatus;
import com.swaply.backend.application.dto.RegisterDTO;

@RestController
@RequestMapping("/api/register")
public class RegisterController {

    // Classe per rebre el JSON del frontend
    
    private final AccountService service;

    public RegisterController(@Autowired AccountService service) {
        this.service = service;
    }

    @PostMapping("/save")
    public ResponseEntity saveRegister(@RequestBody RegisterDTO dto) {
        return ResponseEntity.ok(service.register(dto));
    }
    // @PostMapping("/save")
    // public ResponseEntity<List<RegisterDTO>> guardarRegister(@RequestBody RegisterRequest request, RegisterDTO dto) {
    //     return ResponseEntity.ok(service.register(dto, request));
    // }


    @PostMapping("/email")
    public ResponseEntity<String> generateCode(@RequestBody String email) {
        return service.code(email);
    }

}
