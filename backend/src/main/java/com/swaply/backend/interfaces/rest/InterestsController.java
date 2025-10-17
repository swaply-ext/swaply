package com.swaply.backend.interfaces.rest;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/interests")
public class InterestsController {
    // Aquesta classe rep el JSON del frontend
    public static class InterestsRequest {
        private List<String> interests;
        public List<String> getInterests() { return interests; }
        public void setInterests(List<String> interests) { this.interests = interests; }
    }

    @PostMapping("/guardar")
    public String guardarInterests(@RequestBody InterestsRequest request) {
        System.out.println("Intereses recibidos!");
        System.out.println(request.getInterests()); 
        return "Intereses recibidos correctamente!";
    }
}
