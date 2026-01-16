package com.swaply.backend.application.home.service;

import com.swaply.backend.application.home.HomeMapper;
import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.application.skills.dto.SkillDisplayDTO;
import com.swaply.backend.application.skills.SkillsMapper;
import com.swaply.backend.shared.UserCRUD.Model.Skills;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.UserCRUD.UserService;

import org.springframework.stereotype.Service;
import com.swaply.backend.shared.location.LocationService;
import com.swaply.backend.application.skills.service.SkillsService;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class HomeService {

    private final UserService userService;
    private final LocationService locationService;
    private final SkillsService skillsService;
    private final SkillsMapper skillsMapper;
    private final HomeMapper homeMapper;

    public HomeService(UserService userService, LocationService locationService, SkillsService skillsService,
            SkillsMapper skillsMapper, HomeMapper homeMapper) {
        this.userService = userService;
        this.locationService = locationService;
        this.skillsService = skillsService;
        this.skillsMapper = skillsMapper;
        this.homeMapper = homeMapper;
    }

    // TO DO

    // Accelerar el metodo getRecommendedMatches()
    // La mitdad de los datos que se retornan no son necesarios.
    // Considerar llamar de 6 en 6 al darle a ver mas.
    // DTO Home recommendation

    // Crear un mapper
    // Se puede hacer con mas de un archivo de entrada SkillMapper.java de ejemplo

    public List<UserSwapDTO> getRecommendedMatches(String currentUserId) {
        UserDTO myUser = userService.getUserByID(currentUserId);

        if (myUser == null || myUser.getInterests() == null || myUser.getInterests().isEmpty()) {
            return List.of();
        }

        // Sacar interests con su nivel
        Map<String, Integer> myInterestLevels = myUser.getInterests().stream()
                .collect(Collectors.toMap(
                        s -> s.getId(),
                        s -> s.getLevel() != null ? s.getLevel() : 0,
                        (existing, replacement) -> existing));

        // Sacar skills propios
        List<String> myOfferingIds = myUser.getSkills()
                .stream()
                .map(s -> s.getId())
                .collect(Collectors.toList());

        // Filtrar usuarios con skills según los intereses propios
        List<UserDTO> candidates = userService.getFilterSkills(myUser.getInterests()
                .stream()
                .map(s -> s.getId())
                .collect(Collectors.toList()));
        
                // Devolver usuarios tras aplicar varios filtros
        return candidates.stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .filter(user -> user.getSkills() != null)
                .filter(user -> isReciprocalMatch(user, myOfferingIds))
                .flatMap(user -> extractMatchingSkills(user, myInterestLevels, currentUserId))
                .sorted(Comparator.comparingDouble(d -> {
                    try {
                        return d.getDistance() != null ? Double.parseDouble(d.getDistance()) : Double.MAX_VALUE;
                    } catch (NumberFormatException e) {
                        return Double.MAX_VALUE;
                    }
                }))
                .collect(Collectors.toList());
    }

    // Comprueba si hay match (todo bien hecho)
    private boolean isReciprocalMatch(UserDTO otherUser, List<String> myOfferingIds) {
        if (otherUser.getInterests() == null)
            return false;
        return otherUser.getInterests().stream()
                .map(i -> i.getId())
                .anyMatch(myOfferingIds::contains);
    }

    // Filtra por coincidencias de skill y de nivel
    private Stream<UserSwapDTO> extractMatchingSkills(UserDTO otherUser, Map<String, Integer> myInterestLevels,
            String currentUserId) {
        String distance = locationService.calculateDistance(currentUserId, otherUser.getUsername());

        return otherUser.getSkills().stream()
                .filter(skill -> {
                    String skillId = skill.getId();
                    if (!myInterestLevels.containsKey(skillId))
                        return false;
                    int myLevel = myInterestLevels.get(skillId);
                    int otherLevel = skill.getLevel() != null ? skill.getLevel() : 0;
                    return otherLevel >= myLevel;
                })
                .map(skill -> mapToCard(otherUser, skill, distance));
    }

    // Mapea UserDTO y UserSkills a UserSwapDTO (pasar a mapper????)
    private UserSwapDTO mapToCard(UserDTO user, UserSkills userSkill, String distance) {
        Skills skill = skillsService.getSkill(userSkill.getId());
        UserSwapDTO dto = new UserSwapDTO();
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());

        SkillDisplayDTO skillDisplay = skillsMapper.toDisplayDTO(skill, userSkill);
        dto.setSkill(skillDisplay);

        dto.setUserSkills(user.getSkills());
        dto.setInterests(user.getInterests());

        dto.setDistance(distance != null ? String.valueOf(distance) : null);
        dto.setRating(5.0);
        dto.setSwapMatch(true);

        return dto;
    }

}