package com.swaply.backend.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MailDTO {
    private String email;
    private String subject;
    private String sample; // Muy relativo a revisar
    private String message;
}
