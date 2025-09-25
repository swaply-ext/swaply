package com.swaply.backend.interfaces.rest;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillsController {

    // Aquesta classe rep el JSON del frontend
    public static class SkillsRequest {
        private List<String> skills;
        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }
    }

    @PostMapping
    public String guardarSkills(@RequestBody SkillsRequest request) {
        System.out.println("Skills rebudes del frontend:");
        System.out.println(request.getSkills()); // Imprimeix les skills rebudes
        // Aquí pots guardar-les a la BD si vols
        return "Skills rebudes correctament!";
    }
}