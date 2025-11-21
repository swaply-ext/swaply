package com.swaply.backend.application.skills;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.swaply.backend.application.skills.service.SkillsService;
import com.swaply.backend.shared.UserCRUD.Model.Skills;

@RestController
@RequestMapping("/api/skills")
public class SkillsController {

    // Classe per rebre el JSON del frontend

    private final SkillsService service;

    public SkillsController(SkillsService service) {
        this.service = service;
    }



    @GetMapping
    public ResponseEntity<List<Skills>> searchSkills(@RequestParam(required = false) String query) {
        if(query != null){
            List<Skills> results = service.searchSkills(query);
            return ResponseEntity.ok(results);
        }
        return ResponseEntity.ok(service.getAllSkills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Skills> getSkill(@PathVariable String id) {
        return ResponseEntity.ok(service.getSkill(id));
    }
}
