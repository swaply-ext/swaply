package com.swaply.backend.application.account.dto;

import java.util.List;
import com.swaply.backend.shared.UserCRUD.Model.Skills;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterestsDTO {
    private List<Skills> interest;
}
