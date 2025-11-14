package com.swaply.backend.application.account.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillSearchDTO {
    
    private String id;
    private String name;
    private String category;
    private String icon;
}
