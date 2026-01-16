package com.swaply.backend.application.payment.dto;

import lombok.Data;
import lombok.NoArgsConstructor; 

@Data
@NoArgsConstructor
public class PaymentConfirmationDTO {
    //este id sirve para verificar el pago con Stripe
    private String sessionId;
}