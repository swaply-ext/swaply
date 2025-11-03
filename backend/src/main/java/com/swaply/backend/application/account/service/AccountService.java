package com.swaply.backend.application.account.service;

import com.swaply.backend.shared.UserCRUD.Model.Skills;
import com.swaply.backend.application.account.dto.SkillsDTO;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UpdateUserDTO;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.mail.MailService;
import com.swaply.backend.shared.token.JwtService;
import com.swaply.backend.application.account.AccountMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AccountService /* implements UserRepository */ {

    private final UserService userService; //
    private final JwtService jwtService;
    private final AccountMapper mapper;

    @Value("${frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

    public AccountService(UserService userService,
            MailService mailService,
            JwtService jwtService, 
            AccountMapper mapper) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.mapper = mapper;
    }

    public void UpdatePersonalInfo(String token, UpdateUserDTO dto) {
        try {
            String userId = jwtService.extractUserIdFromSessionToken(token);

            userService.updateUser(userId, dto);

        } catch (Exception e) {
            // Hay que ver si creamos una exception aqui también
            throw new RuntimeException("No se ha podido actualizar la informacion  del usuario", e);
        }
    }

    public void updateSkills(String token, SkillsDTO dto) {
        System.out.println(token);
        System.out.println(dto.getSkills());
        String userid = jwtService.extractUserIdFromSessionToken(token);
        UpdateUserDTO updateUser = mapper.fromSkillsDTO(dto);
        userService.updateUser(userid, updateUser);    
    }
}