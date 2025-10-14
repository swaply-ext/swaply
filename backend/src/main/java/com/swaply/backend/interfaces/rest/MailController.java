package com.swaply.backend.interfaces.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.swaply.backend.application.usecase.MailService;

@RestController
@RequestMapping("/api/mail")
public class MailController {

    private final MailService mailService;

    public MailController(MailService mailService) {
        this.mailService = mailService;
    }

    @PostMapping("/sendCode")
    public ResponseEntity<String> sendTestEmail(@RequestBody MailRequest mailRequest) {
        try {
            mailService.sendEmail(mailRequest.getEmail());
            return ResponseEntity.ok("Correo enviado exitosamente a " + mailRequest.getEmail());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al enviar correo: " + e.getMessage());
        }
    }
}
