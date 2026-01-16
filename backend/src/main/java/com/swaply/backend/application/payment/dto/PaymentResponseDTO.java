package com.swaply.backend.application.payment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponseDTO {
    //url de pago generada por Stripe
    private String paymentUrl;
}