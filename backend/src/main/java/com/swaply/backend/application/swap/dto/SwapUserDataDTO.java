package com.swaply.backend.application.swap.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SwapUserDataDTO extends SwapDTO{
    private String username;
    private String location;
    private String profilePhotoUrl;
}
