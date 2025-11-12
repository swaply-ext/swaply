package com.swaply.backend.application.account.service;

import com.swaply.backend.application.account.dto.PersonalInfoDTO;
import com.swaply.backend.application.account.dto.ProfileDataDTO;
import com.swaply.backend.application.account.dto.SkillsDTO;
import com.swaply.backend.application.account.dto.InterestsDTO;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
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
            AccountMapper mapper) {
        this.userService = userService;
        this.mapper = mapper;
    }

    public void UpdatePersonalInfo(String userId, PersonalInfoDTO dto) {
            UserDTO userDto = mapper.fromPersonalInfoDTO(dto);
            userService.updateUser(userId, userDto);
    }


    public void updateSkills(String userId, SkillsDTO dto) {
        UserDTO updateUser = mapper.fromSkillsDTO(dto);
        userService.updateUser(userId, updateUser);
    }

    public void updateInterests(String userId, InterestsDTO dto) {
        UserDTO updateUser = mapper.fromInterestsDTO(dto);
        userService.updateUser(userId, updateUser);
    }

    public ProfileDataDTO getProfileData(String userId) {
        UserDTO userDTO = userService.getUserByID(userId);
        return mapper.profileDatafromUserDTO(userDTO);
    }

    public void UpdateProfileData(String userId, ProfileDataDTO dto) {
            UserDTO userDto = mapper.fromProfileDataDTO(dto);
            userService.updateUser(userId, userDto);
    }
}