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
        System.out.println("--- BÚSQUEDA INICIADA ---");
        System.out.println("Buscando: " + query + " | Usuario: " + myUserId);
        System.out.println("Mi ID: " + myUserId);
        // Validación básica
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        List<User> candidates;
        String cleanQuery = normalizeString(query);

        if (query.contains(",")) {
            // Si viene con comas, es una lista de IDs del filtro
            List<String> skillIds = Arrays.stream(query.split(","))
                    .map(String::trim)
                    .map(this::normalizeString)
                    .collect(Collectors.toList());
            
            candidates = userRepository.findUsersByMultipleSkillIds(skillIds);
        } else {
            // Búsqueda normal de texto
            candidates = userRepository.findUsersBySingleSkillId(cleanQuery);
        }
        System.out.println(" Candidatos encontrados en BD: " + candidates.size());
        candidates.forEach(u -> System.out.println("   -> Candidato: " + u.getUsername() + " (ID: " + u.getId() + ", Loc: " + u.getLocation() + ")"));




        // OBTENER MIS DATOS (¡Aquí usamos myUserId!)
        // Usamos tu método optimizado 'findUserById' que incluye la Partition Key
        User me = userRepository.findUserById(myUserId).orElse(null);
        
        if (me == null) {
            System.out.println("ERROR CRÍTICO: No se encontró al usuario logueado en la BD.");
            // Continuamos para debug, pero esto debería devolver vacío en producción
        } else {
            System.out.println("👤 Mis datos cargados: " + me.getUsername() + ", Loc: " + me.getLocation());
        }

        // Sacamos los IDs de TUS skills para comparar
        Set<String> myOfferingIds = (me != null && me.getSkills() != null) 
                ? me.getSkills().stream().map(UserSkills::getId).collect(Collectors.toSet())
                : Collections.emptySet();
        
        String myLocation = (me != null && me.getLocation() != null) 
                ? me.getLocation().toLowerCase().trim() : "";

        // 3. FILTRAR Y MAPEAR
        List<UserSwapDTO> results = candidates.stream()
            // FILTRO 1: ¡Aquí usamos myUserId otra vez! (Para no mostrarte a ti mismo)
            .filter(candidate -> !candidate.getId().equals(myUserId)) 
            
            // FILTRO 2: Ubicación
            .filter(candidate -> filterByLocation(candidate, myLocation))
            
            // MAPEO: Calculamos el Match
            .map(candidate -> {
                boolean isMatch = false;
                if (candidate.getInterests() != null) {
                    isMatch = candidate.getInterests().stream()
                            .anyMatch(interest -> myOfferingIds.contains(interest.getId()));
                }
                
                return mapToUserSwapDTO(candidate, query, isMatch);
            })
            .sorted(Comparator.comparing(UserSwapDTO::isSwapMatch).reversed())
            .collect(Collectors.toList());

            System.out.println("Resultados finales enviados: " + results.size());
            return results;
    }

    private boolean filterByLocation(User candidate, String myLocation) {
        if (myLocation.isEmpty()) return true;
        if (candidate.getLocation() == null) return false;
        
        String candidateLoc = candidate.getLocation().toLowerCase();
        return candidateLoc.contains(myLocation) || myLocation.contains(candidateLoc);
    }

    private UserSwapDTO mapToUserSwapDTO(User user, String query, boolean isMatch) {
        UserSwapDTO dto = new UserSwapDTO();
        
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        dto.setLocation(user.getLocation());
        dto.setRating(4.8); 
        dto.setDistance("Cerca de ti"); 
        dto.setSwapMatch(isMatch);

        if (user.getSkills() != null) {
            List<String> searchTerms = query.contains(",") 
                    ? Arrays.asList(query.split(",")) 
                    : List.of(query);
            user.getSkills().stream()
                    .filter(s -> s.getId() != null && searchTerms.stream().anyMatch(term -> s.getId().contains(term.trim())))
                    .findFirst()
                    .ifPresent(s -> {
                        // Importante: UserSkills debe tener estos getters
                       dto.setSkillName(s.getName() != null ? s.getName() : s.getId()); 
                        // Si el icono es null, ponemos un emoji por defecto
                        dto.setSkillIcon(s.getIcon() != null ? s.getIcon() : "🎓");
                        dto.setSkillCategory(s.getCategory());
                        dto.setSkillLevel(s.getLevel());
                    });
        }
        return dto;
    }
}