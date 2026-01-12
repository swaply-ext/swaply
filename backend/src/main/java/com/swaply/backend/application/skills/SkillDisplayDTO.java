package com.swaply.backend.application.skills;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillDisplayDTO {
    String id;
    String name;
    String category;
    String icon;
    Integer level;
}
