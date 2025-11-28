package com.swaply.backend.application.account.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import com.swaply.backend.shared.UserCRUD.Model.UserSkills;

import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillsDTO {
    private List<UserSkills> skills;
    private List<UserSkills> interests;
}
