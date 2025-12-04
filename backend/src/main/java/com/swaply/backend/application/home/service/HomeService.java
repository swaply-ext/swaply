package com.swaply.backend.application.home.service;

import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HomeService {

    // Solo necesitamos el Repositorio
    private final UserRepository userRepository;

    public HomeService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserSwapDTO> getRecommendedMatches(String currentUserId) {
        // CORRECCIÓN: Usamos el repositorio para obtener la Entidad 'User' (no el DTO)
        User currentUser = userRepository.findUserById(currentUserId).orElse(null);
        
        if (currentUser == null) return List.of();

        // Protección contra nulos
        if (currentUser.getInterests() == null || currentUser.getInterests().isEmpty()) {
            return List.of(); 
        }

        List<String> interestIds = currentUser.getInterests().stream()
                .map(UserSkills::getId)
                .collect(Collectors.toList());

        // Buscamos usuarios que ofrezcan esos intereses
        // (Asegúrate de tener 'findUsersByMultipleSkillIds' en tu UserRepository, ver punto 2 abajo)
        List<User> matchedUsers = userRepository.findUsersByMultipleSkillIds(interestIds);

        List<UserSwapDTO> recommendations = new ArrayList<>();

        for (User otherUser : matchedUsers) {
            if (otherUser.getId().equals(currentUserId)) continue;
            if (otherUser.getSkills() == null) continue;

            for (UserSkills skill : otherUser.getSkills()) {
                if (interestIds.contains(skill.getId())) {
                    recommendations.add(mapToCard(otherUser, skill));
                }
            }
        }

        return recommendations;
    }

    private UserSwapDTO mapToCard(User user, UserSkills skill) {
        UserSwapDTO dto = new UserSwapDTO();
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        
        dto.setSkillName("Clase de " + (skill.getName() != null ? skill.getName() : skill.getId()));     
        dto.setSkillCategory(skill.getCategory());
        dto.setSkillLevel(skill.getLevel());
        dto.setSkillIcon(skill.getIcon() != null ? skill.getIcon() : "🎓");
        
        dto.setDistance("Recomendado");
        dto.setRating(5.0);
        dto.setSwapMatch(true); 
        
        return dto;
    }
}