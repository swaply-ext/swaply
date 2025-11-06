package com.swaply.backend.application.account.service;

import com.swaply.backend.application.account.dto.SkillsDTO;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.mail.MailService;
import com.swaply.backend.application.account.AccountMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AccountService /* implements UserRepository */ {

    private final UserService userService;
    private final AccountMapper mapper;

    @Value("${frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

    public AccountService(UserService userService,
            MailService mailService, 
            AccountMapper mapper) {
        this.userService = userService;
        this.mapper = mapper;
    }

    // public void UpdatePersonalInfo(String token, UpdateUserDTO dto) {
    //     try {
    //         String userId = jwtService.extractUserIdFromSessionToken(token);

    //         // userService.updateUser(userId, dto); 

    //     } catch (Exception e) {
    //         // Hay que ver si creamos una exception aqui también
    //         throw new RuntimeException("No se ha podido actualizar la informacion  del usuario", e);
    //     }
    // }

    public void updateSkills(String userid, SkillsDTO dto) {
        UserDTO updateUser = mapper.fromSkillsDTO(dto);
        userService.updateUser(userid, updateUser);    
    }

    // public ProfileDataDTO ShowProfileData(String token) {
    //     try {
    //         String userId = jwtService.extractUserIdFromSessionToken(token);

    //         return userService.getUserProfileDataByID(userId);

    //     } catch (Exception e) {
    //         // Hay que ver si creamos una exception aqui también
    //         throw new RuntimeException("No se ha podido obtener la informacion  del usuario", e);
    //     }
    // }
}