package com.swaply.backend.application.account;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.swaply.backend.application.account.dto.ProfileDataDTO;
import com.swaply.backend.application.account.service.AccountService;
import com.swaply.backend.shared.UserCRUD.dto.UpdateUserDTO;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    // Classe per rebre el JSON del frontend

    private final AccountService service;

    public AccountController(AccountService service) {
        this.service = service;
    }

    @PostMapping("/personalInfo")
    public ResponseEntity<Boolean> personalInfo(@RequestBody String token, UpdateUserDTO dto) {
        service.UpdatePersonalInfo(token, dto);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(true);
    }

    // @PatchMapping("/skills/{id}")
    // public ResponseEntity<UserDTO> addSkills(@PathVariable String id){
    // return ResponseEntity.ok(service.addSkills(id));
    // }

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

}
