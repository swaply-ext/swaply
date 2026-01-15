package com.swaply.backend.application.payment;

import com.swaply.backend.application.payment.dto.PaymentResponseDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    
    default PaymentResponseDTO urlToPaymentResponseDTO(String url) {
    return PaymentResponseDTO.builder()
                .paymentUrl(url)
                .build();
    }
}