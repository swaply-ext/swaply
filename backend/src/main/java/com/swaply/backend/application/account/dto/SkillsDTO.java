package com.swaply.backend.application.account.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import com.swaply.backend.shared.UserCRUD.Model.Skills;

import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillsDTO {
    private String userId;
    private List<Skills> skills;
}
