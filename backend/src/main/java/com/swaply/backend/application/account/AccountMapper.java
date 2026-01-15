package com.swaply.backend.application.account;

import com.swaply.backend.application.account.dto.ProfileDataDTO;
import com.swaply.backend.application.account.dto.PublicProfileDTO;
import com.swaply.backend.application.account.dto.SkillsDTO;
import com.swaply.backend.application.account.dto.EditProfileDTO;
import com.swaply.backend.application.account.dto.PersonalInfoDTO;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.application.account.dto.UsernameDTO;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
        // Si campo esta vacio "null" en el DTO no lo añade al entity "modelo"
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)

public interface AccountMapper {

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    UserDTO fromSkillsDTO(SkillsDTO dto);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    UserDTO fromInterestsDTO(SkillsDTO dto);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    ProfileDataDTO profileDatafromUserDTO(UserDTO dto);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    UserDTO fromPersonalInfoDTO(PersonalInfoDTO dto);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    UserDTO fromProfileDataDTO(ProfileDataDTO dto);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    EditProfileDTO editDatafromUserDTO(UserDTO dto);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    UserDTO fromEditProfileDataDTO(EditProfileDTO dto);
    
    ProfileDataDTO profileFromUserDTO(UserDTO dto);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "fullName", expression = "java(dto.getName() + \" \" + dto.getSurname())")
    PublicProfileDTO mapUserToPublicProfile(UserDTO dto);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    UsernameDTO mapUserToUsernameDTO(UserDTO dto);
}


