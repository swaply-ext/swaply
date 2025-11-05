package com.swaply.backend.application.account;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.azure.core.annotation.Get;
import com.swaply.backend.application.account.dto.ProfileDataDTO;
import com.swaply.backend.application.account.dto.SkillsDTO;
import com.swaply.backend.application.account.service.AccountService;

import io.micrometer.core.ipc.http.HttpSender.Response;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    // Classe per rebre el JSON del frontend

    private final AccountService service;

    public AccountController(AccountService service) {
        this.service = service;
    }

    // @PostMapping("/personalInfo")
    // public ResponseEntity<Boolean> personalInfo(@RequestBody String token, UpdateUserDTO dto) {
    //     service.UpdatePersonalInfo(token, dto);
    //     return ResponseEntity.status(HttpStatus.ACCEPTED).body(true);
    // }

    @PatchMapping("/skills")
    public ResponseEntity<String> updateSkills(@RequestHeader("Authorization") String token, @RequestBody SkillsDTO dto) {
        token = token.replace("Bearer ", "");//Temporal es una CERDADA, Marc esta trabajando en esto
        service.updateSkills(token, dto);
        return ResponseEntity.ok(null);
    }

    // NO TOCAR --- EN DESARROLLO ALEIX I ARNAU, NOOOOO TOCAR
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Hace falta el maper y el service para entrar en lógica
    // metodo para enviar datos de profile a frontend, en desarrollo arnau y aleix.

    /*
     * @GetMapping("/profileData") // 1. És un GET, no un POST
     * public ResponseEntity<ProfileDataDTO> getProfileData(
     * // 2. El token ve en una capçalera, NO al body
     * 
     * @RequestHeader("Authorization") String authorizationHeader) {
     * 
     * // 3. Cridem al servei i ens retorna el DTO amb les dades
     * ProfileDataDTO profileData = service.getProfileData(authorizationHeader);
     * 
     * // 4. Retornem el DTO amb un 200 OK. Angular rebrà el JSON.
     * return ResponseEntity.ok(profileData);
     * }
     */

    // TOCAR A PARTIR DE AQUI ABAJO:
    @GetMapping("/profileData")
    public ResponseEntity<ProfileDataDTO> getProfileData(@RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        ProfileDataDTO profileData = service.getProfileData(token);
        return ResponseEntity.ok(profileData) ;
    }
}
