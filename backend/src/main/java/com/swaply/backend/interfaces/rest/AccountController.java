package com.swaply.backend.interfaces.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swaply.backend.application.usecase.AccountService;
import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RecoveryCodeResponseDTO;
import com.swaply.backend.application.dto.RecoveryPasswordRecieveDTO;
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
    public ResponseEntity<?> recoveryCode(@RequestBody String email) {
        try{
            RecoveryCodeResponseDTO recoverycode = service.recoveryCode(email);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(recoverycode);
            
        }catch (NullPointerException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No mail");

        }
    }

    @PostMapping("/recoveryPassword")
    public ResponseEntity<Boolean> recoveryPassword(@RequestBody RecoveryPasswordRecieveDTO dto) {
        
        try {
            service.recoveryPassword(dto);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(true);
        
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }

    }

    @PostMapping("/mailVerify")
    public ResponseEntity<String> mailVerify(@RequestBody String email) {

        try {
            String code = service.mailVerify(email);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(code);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("El usuario ya existe");
        }
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

}
