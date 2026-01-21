package com.swaply.backend.application.payment;

import com.swaply.backend.application.payment.service.PaymentService;
import com.swaply.backend.config.security.SecurityUser;
import lombok.RequiredArgsConstructor;

import java.util.Collections;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckout(@AuthenticationPrincipal SecurityUser securityUser) {
        if (securityUser == null) {
            return ResponseEntity.status(401).build(); //opcional, si quereis quitarlo se quita
        } 
        String url = paymentService.createPremiumCheckoutSession(securityUser.getUsername());
        return ResponseEntity.ok(Collections.singletonMap("paymentUrl", url)); 
    }

@PostMapping("/success")
    public ResponseEntity<Void> confirmPayment(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestBody Map<String, String> payload) { 

                if (securityUser == null) {
            return ResponseEntity.status(401).build(); //igual que el de arriba
        }

        String sessionId = payload.get("sessionId");
        // El servicio se encarga de verificar y lanzar excepciones si algo falla
        paymentService.confirmPremiumPayment(sessionId, securityUser.getUsername());
        
        return ResponseEntity.ok().build();
    }
}