package com.swaply.backend.application.account.service;

import com.swaply.backend.application.account.dto.EditProfileDTO;
import com.swaply.backend.application.account.dto.PersonalInfoDTO;
import com.swaply.backend.application.account.dto.ProfileDataDTO;
import com.swaply.backend.application.account.dto.PublicProfileDTO;
import com.swaply.backend.application.account.dto.SkillsDTO;
import com.swaply.backend.application.account.dto.UsernameDTO;
import com.swaply.backend.application.auth.exception.UserAlreadyExistsException;
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

    public void updateInterests(String userId, SkillsDTO dto) {
        UserDTO updateUser = mapper.fromInterestsDTO(dto);
        userService.updateUser(userId, updateUser);
    }

    public ProfileDataDTO getProfileData(String userId) {
        UserDTO userDTO = userService.getUserByID(userId);
        return mapper.profileDatafromUserDTO(userDTO);
    }

    public void updateProfileData(String userId, ProfileDataDTO dto) {
        UserDTO userDto = mapper.fromProfileDataDTO(dto);
        userService.updateUser(userId, userDto);
    }

    public EditProfileDTO getEditProfileData(String userId) {
        UserDTO userDTO = userService.getUserByID(userId);
        return mapper.editDatafromUserDTO(userDTO);
    }

    public void updateEditProfileData(String userId, EditProfileDTO dto) {
        UserDTO newUserDTO = mapper.fromEditProfileDataDTO(dto);
        UserDTO currentUserDTO = userService.getUserByID(userId);
        //Comprobar si el username ha cambiado y si el nuevo ya existe
        if (!currentUserDTO.getUsername().equals(dto.getUsername())) {
            if (userService.existsByUsername(dto.getUsername())) {
                throw new UserAlreadyExistsException("El usuario: " + dto.getUsername() + " ya esta en uso.");
            }
        }
        userService.updateUser(userId, newUserDTO);
    }

    public ProfileDataDTO getAccount(String userId){
        UserDTO user = userService.getUserByID(userId);
        ProfileDataDTO account = mapper.profileFromUserDTO(user);
        return account;
    }

    public PublicProfileDTO getPublicProfileByUsername(String username) {
        UserDTO userDTO = userService.getUserByUsername(username);
        return mapper.mapUserToPublicProfile(userDTO);
    }
  
    public void deleteUser(String userId) {
        userService.deleteUserById(userId);
    }
    public UsernameDTO getUsername(String userId) {
        UserDTO userDTO = userService.getUserByID(userId);
        return new UsernameDTO(userDTO.getUsername());
    
    }
}