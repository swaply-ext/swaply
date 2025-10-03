package com.swaply.backend.application.mapper;

import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.domain.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO entityToDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getType(),
            user.getUsername(),
            user.getFullName(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getLocation(),
            user.getGender(),
            user.getAge(),
            user.getDescription(),
            user.isVerified(),
            user.getProfilePhotoUrl(),
            user.isPremium(),
            user.isModerator()
        );
    }

    public User dtoToEntity(UserDTO dto) {
        User user = new User();
        user.setId(dto.getId());
        user.setType(dto.getType());
        user.setUsername(dto.getUsername());
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(dto.getPasswordHash());
        user.setLocation(dto.getLocation());
        user.setGender(dto.getGender());
        user.setAge(dto.getAge());
        user.setDescription(dto.getDescription());
        user.setVerified(dto.isVerified());
        user.setProfilePhotoUrl(dto.getProfilePhotoUrl());
        user.setPremium(dto.isPremium());
        user.setModerator(dto.isModerator());
        return user;
    }
}
