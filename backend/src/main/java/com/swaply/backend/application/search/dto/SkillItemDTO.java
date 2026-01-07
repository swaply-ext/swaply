package com.swaply.backend.application.search.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillItemDTO {
    private String name;
    private String category;
    private Integer level;
}