package com.swaply.backend.application.swap.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SwapDTO {
    private String requestedUserId;
    private String skill;
    private String interest;
}