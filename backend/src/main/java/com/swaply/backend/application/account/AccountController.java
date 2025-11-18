package com.swaply.backend.application.account;


import com.swaply.backend.shared.UserCRUD.dto.EditProfileDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.swaply.backend.application.account.dto.PersonalInfoDTO;
import com.swaply.backend.application.account.dto.ProfileDataDTO;
import com.swaply.backend.application.account.dto.SkillsDTO;
import com.swaply.backend.application.account.dto.InterestsDTO;
import com.swaply.backend.application.account.service.AccountService;
import com.swaply.backend.config.security.SecurityUser;


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
        System.out.println(SecurityUser.getUsername());
        service.updateSkills(SecurityUser.getUsername(), dto);
        return ResponseEntity.ok(null);
    }

    @PatchMapping("/interests")
    public ResponseEntity<String> updateInterests(@AuthenticationPrincipal SecurityUser SecurityUser, @RequestBody InterestsDTO dto) {
        System.out.println(SecurityUser.getUsername());
        service.updateInterests(SecurityUser.getUsername(), dto);
        return ResponseEntity.ok(null);    
    }

    @GetMapping("/profileData")
    public ResponseEntity<ProfileDataDTO> getProfileData(@AuthenticationPrincipal SecurityUser SecurityUser) {
        ProfileDataDTO profileData = service.getProfileData(SecurityUser.getUsername());
        return ResponseEntity.ok(profileData);
    }

    @PatchMapping("/changeData")
    public ResponseEntity<Boolean> updateProfileData(@AuthenticationPrincipal SecurityUser SecurityUser, @RequestBody ProfileDataDTO dto) {
        service.updateProfileData(SecurityUser.getUsername(), dto);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(true);
    }

    @GetMapping("/editProfileData")
    public ResponseEntity<EditProfileDTO> getEditProfileData(@AuthenticationPrincipal SecurityUser SecurityUser) {
        EditProfileDTO profileData = service.getEditProfileData(SecurityUser.getUsername());
        return ResponseEntity.ok(profileData);
    }
}
