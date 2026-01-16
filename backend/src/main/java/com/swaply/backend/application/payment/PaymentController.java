package com.swaply.backend.application.payment;

import com.swaply.backend.application.payment.dto.PaymentConfirmationDTO;
import com.swaply.backend.application.payment.dto.PaymentResponseDTO;
import com.swaply.backend.application.payment.service.PaymentService;
import com.swaply.backend.config.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    @PostMapping("/checkout")
    public ResponseEntity<PaymentResponseDTO> createCheckout(@AuthenticationPrincipal SecurityUser securityUser) {

        if (securityUser == null) {
            return ResponseEntity.status(401).build(); //opcional, si quereis quitarlo se quita
        } 

        try{
        //se pasam el ID del usuario para vincularlo a la sesión
        String paymentUrl = paymentService.createPremiumCheckoutSession(securityUser.getId());
        PaymentResponseDTO response = paymentMapper.urlToPaymentResponseDTO(paymentUrl);
        return ResponseEntity.ok(response);

        //si el suario ya es premium devolvemos conflicto (409) o BadRequest (400)
        } catch (IllegalStateException e) { 
            return ResponseEntity.status(409).build(); 
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
        
    }

@PostMapping("/success")
    public ResponseEntity<Void> confirmPayment(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestBody PaymentConfirmationDTO confirmationDTO) { 

                if (securityUser == null) {
            return ResponseEntity.status(401).build(); //igual que el de arriba
        }
        
        // El servicio se encarga de verificar y lanzar excepciones si algo falla
        paymentService.confirmPremiumPayment(confirmationDTO.getSessionId(), securityUser.getId());
        
        return ResponseEntity.ok().build();
    }
}