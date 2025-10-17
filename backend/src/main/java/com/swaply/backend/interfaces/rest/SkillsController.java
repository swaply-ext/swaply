package com.swaply.backend.interfaces.rest;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillsController {

    // Aquesta classe rep el JSOOOOOOOOOOOOON del frontend
    public static class SkillsRequest {
        private List<String> skills;
        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }
    }

    @PostMapping("/save")
    public String guardarSkills(@RequestBody SkillsRequest request) {
        System.out.println("Skills recibidas!");
        System.out.println(request.getSkills()); 
        return "Skills recibidas correctamente!";
    }
}
