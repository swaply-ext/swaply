package com.swaply.backend.application.account;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.swaply.backend.application.account.dto.PersonalInfoDTO;
import com.azure.core.annotation.Get;
import com.swaply.backend.application.account.dto.ProfileDataDTO;
import com.swaply.backend.application.account.dto.SkillsDTO;
import com.swaply.backend.application.account.service.AccountService;
import com.swaply.backend.config.security.SecurityUser;

import io.micrometer.core.ipc.http.HttpSender.Response;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    // Classe per rebre el JSON del frontend

    private final AccountService service;

    public AccountController(AccountService service) {
        this.service = service;
    }

    @PostMapping("/personalInfo")
    public ResponseEntity<Boolean> updatePersonalInfo(
            @AuthenticationPrincipal SecurityUser SecurityUser,
            @RequestBody PersonalInfoDTO dto) {
        service.UpdatePersonalInfo(SecurityUser.getUsername(), dto);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(true);
    }

    @PatchMapping("/skills")
    public ResponseEntity<String> updateSkills(@AuthenticationPrincipal SecurityUser SecurityUser, @RequestBody SkillsDTO dto) {
        service.updateSkills(SecurityUser.getUsername(), dto);
        return ResponseEntity.ok(null);
    }

    @GetMapping("/profileData")
    public ResponseEntity<ProfileDataDTO> getProfileData(
            @RequestParam("id") String userId) {
        ProfileDataDTO profileData = service.getProfileData(userId);
        return ResponseEntity.ok(profileData);
    }
}
