package com.swaply.backend.application.account;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.swaply.backend.application.account.service.AccountService;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    // Classe per rebre el JSON del frontend

    private final AccountService service;

    public AccountController( AccountService service) {
        this.service = service;
    }

    // Esto hay que mirarlo seguramente el Front no deberia tener el código solo un
    // boolean al enviarlo

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

    // @PatchMapping("/skills/{id}")
    // public ResponseEntity<UserDTO> addSkills(@PathVariable String id){
    //     return ResponseEntity.ok(service.addSkills(id));
    // }

}
