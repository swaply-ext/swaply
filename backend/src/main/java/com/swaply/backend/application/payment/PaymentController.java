package com.swaply.backend.application.payment;

import com.swaply.backend.application.payment.dto.PaymentResponseDTO;
import com.swaply.backend.application.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    @PostMapping("/checkout")
    public ResponseEntity<PaymentResponseDTO> createCheckout() {
        String paymentUrl = paymentService.createPremiumCheckoutSession();
        PaymentResponseDTO response = paymentMapper.urlToPaymentResponseDTO(paymentUrl);
        return ResponseEntity.ok(response);
    }
}