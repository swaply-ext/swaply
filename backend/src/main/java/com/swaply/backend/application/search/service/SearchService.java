package com.swaply.backend.application.search.service;

import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final UserRepository userRepository;

    public SearchService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private String normalizeString(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase();
    }

    public List<UserSwapDTO> searchUsersWithMatch(String query, String myUserId) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        List<User> candidates;
        String cleanQuery = normalizeString(query);

        // 1. BÚSQUEDA EN BD (Obtener candidatos)
        if (query.contains(",")) {
            List<String> skillIds = Arrays.stream(query.split(","))
                    .map(String::trim)
                    .map(this::normalizeString)
                    .collect(Collectors.toList());
            candidates = userRepository.findUsersByMultipleSkillIds(skillIds);
        } else {
            candidates = userRepository.findUsersBySingleSkillId(cleanQuery);
        }

        // 2. MIS DATOS (Para comparar)
        User me = userRepository.findUserById(myUserId).orElse(null);

        // Mis ofertas para el Match
        Set<String> myOfferingIds = (me != null && me.getSkills() != null)
                ? me.getSkills().stream().map(UserSkills::getId).collect(Collectors.toSet())
                : Collections.emptySet();

        // Mi ubicación normalizada
        String myLocation = (me != null && me.getLocation() != null)
                ? me.getLocation().toLowerCase().trim() : "";

        return candidates.stream()
                // Filtro 1: No mostrarme a mí mismo
                .filter(candidate -> !candidate.getId().equals(myUserId))

                .map(candidate -> {
                    // A. Lógica de Match (Intereses cruzados)
                    boolean isMatch = false;
                    if (candidate.getInterests() != null) {
                        isMatch = candidate.getInterests().stream()
                                .anyMatch(interest -> myOfferingIds.contains(interest.getId()));
                    }

                    // B. Lógica de Ubicación (Cerca/Lejos)
                    boolean isClose = checkLocationMatch(candidate, myLocation);
                    String distanceLabel = isClose ? "Cerca de ti" : "Lejos de ti";

                    return mapToUserSwapDTO(candidate, query, isMatch, distanceLabel, isClose);
                })
                //ordena
                .sorted(
                        Comparator.comparing(UserSwapDTO::isSwapMatch, Comparator.reverseOrder())
                                .thenComparing(dto -> isCloseFromLabel(dto.getDistance()), Comparator.reverseOrder())
                )
                .collect(Collectors.toList());
    }

    private boolean isCloseFromLabel(String label) {
        return "Cerca de ti".equals(label);
    }

    private boolean checkLocationMatch(User candidate, String myLocation) {
        if (myLocation.isEmpty()) return false;
        if (candidate.getLocation() == null) return false;

        String candidateLoc = candidate.getLocation().toLowerCase();
        return candidateLoc.contains(myLocation) || myLocation.contains(candidateLoc);
    }

    private UserSwapDTO mapToUserSwapDTO(User user, String query, boolean isMatch, String distanceLabel, boolean isClose) {
        UserSwapDTO dto = new UserSwapDTO();

        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        dto.setLocation(user.getLocation());
        dto.setRating(4.8);
        dto.setDistance(distanceLabel);
        dto.setSwapMatch(isMatch);

        if (user.getSkills() != null) {
            List<String> searchTerms = query.contains(",")
                    ? Arrays.asList(query.split(","))
                    : List.of(query);

            user.getSkills().stream()
                    .filter(s -> s.getId() != null && searchTerms.stream().anyMatch(term -> s.getId().contains(term.trim())))
                    .findFirst()
                    .ifPresent(s -> {
                        dto.setSkillName(s.getName() != null ? s.getName() : s.getId());
                        dto.setSkillIcon(s.getIcon() != null ? s.getIcon() : "🎓");
                        dto.setSkillCategory(s.getCategory());
                        dto.setSkillLevel(s.getLevel());
                    });
            
            // También rellenamos la lista completa aquí por si se necesita en el futuro en la búsqueda
             List<UserSwapDTO.SkillItem> allSkills = user.getSkills().stream()
                .map(skill -> new UserSwapDTO.SkillItem(
                        skill.getName() != null ? skill.getName() : skill.getId(),
                        skill.getCategory(),
                        skill.getLevel()
                ))
                .collect(Collectors.toList());
             dto.setUserSkills(allSkills);
        }
        return dto;
    }

    // --- MÉTODO ACTUALIZADO PARA RELLENAR LA LISTA DE SKILLS ---
    public UserSwapDTO getUserById(String userId) {
        Optional<User> userOpt = userRepository.findUserById(userId);

        if (userOpt.isEmpty()) {
            return null;
        }

        User user = userOpt.get();

        UserSwapDTO dto = new UserSwapDTO();
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        dto.setLocation(user.getLocation());

        // Si tiene skills, usamos la primera para la info principal
        // Y rellenamos la lista completa 'userSkills'
        if (user.getSkills() != null && !user.getSkills().isEmpty()) {
            
            // 1. Info Principal (Header del componente)
            UserSkills s = user.getSkills().get(0);
            dto.setSkillName(s.getName() != null ? s.getName() : s.getId());
            dto.setSkillIcon(s.getIcon() != null ? s.getIcon() : "🎓");
            dto.setSkillLevel(s.getLevel());
            dto.setSkillCategory(s.getCategory());

            // 2. LISTA COMPLETA DE SKILLS (Para el panel de intereses)
            List<UserSwapDTO.SkillItem> allSkills = user.getSkills().stream()
                    .map(skill -> new UserSwapDTO.SkillItem(
                            skill.getName() != null ? skill.getName() : skill.getId(),
                            skill.getCategory(),
                            skill.getLevel()
                    ))
                    .collect(Collectors.toList());
            
            dto.setUserSkills(allSkills);
        }

        dto.setRating(4.8);
        dto.setDistance("Cerca de ti");
        dto.setSwapMatch(false);

        return dto;
    }
}