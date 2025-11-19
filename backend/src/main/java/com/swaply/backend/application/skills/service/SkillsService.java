package com.swaply.backend.application.skills.service;

import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.Model.Skills;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;
import com.swaply.backend.application.skills.SkillsRepository;
import com.swaply.backend.application.skills.SkillsMapper;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SkillsService /* implements UserRepository */ {

    private final SkillsRepository repository;

    @Value("${frontend.reset-password-url}")
    private String resetPasswordBaseUrl;

    public SkillsService(UserService userService,
            SkillsMapper mapper, SkillsRepository repository) {
        this.repository = repository;
    }

    private String normalizeString(String input) {
        if (input == null)
            return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        // Elimina las marcas de acentos
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase();
    }

    public List<Skills> searchSkills(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        String cleanQuery = normalizeString(query);
        return repository.findSkillsbyContaining(cleanQuery);
    }

    public Skills getSkill(String id) {
        Skills skill = repository.getSkillsbyId(id)
                .orElseThrow(() -> new UserNotFoundException("Skill not found with id: " + id)); // Crear exception??
        return skill;
    }

    public List<Skills> getAllSkills() {
        return repository.findAllSkills()
                .stream()
                .collect(Collectors.toList());
    }
}