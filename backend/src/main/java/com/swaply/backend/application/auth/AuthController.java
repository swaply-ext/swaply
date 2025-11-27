package com.swaply.backend.application.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.application.auth.service.AuthService;
import com.swaply.backend.application.auth.service.UpdatePasswordService;
import com.swaply.backend.config.security.SecurityUser;
import com.swaply.backend.application.auth.dto.ChangePasswordDTO;
import com.swaply.backend.application.auth.dto.LoginDTO;
import com.swaply.backend.application.auth.dto.RegisterActivationDTO;
import com.swaply.backend.application.auth.dto.RegisterInitialDTO;
import com.swaply.backend.application.auth.dto.ResetPasswordDTO;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Classe per rebre el JSON del frontend

    private final AuthService service;
    private final UpdatePasswordService updatePasswordService;

    public AuthController(AuthService service, UpdatePasswordService updatePasswordService) {
        this.service = service;
        this.updatePasswordService = updatePasswordService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody RegisterInitialDTO dto) {
        UserDTO newUser = service.initialRegister(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    @PostMapping("/registerCodeVerify")
    public ResponseEntity<String> completeRegistration(@RequestBody RegisterActivationDTO dto) {
        String token = service.completeRegistration(dto);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(token);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO dto) {
        String token = service.login(dto);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/recoveryMail")
    public ResponseEntity<String> generateAndSendResetLink(@RequestBody String email) {
        updatePasswordService.generateAndSendResetLink(email);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @PostMapping("/passwordReset")
    public ResponseEntity<Boolean> resetPassword(@RequestBody ResetPasswordDTO dto) {
        updatePasswordService.resetPassword(dto);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(null);
    }

    @PostMapping("/passwordChange")
    public ResponseEntity<Boolean> changePassword(@AuthenticationPrincipal SecurityUser securityUser, @RequestBody ChangePasswordDTO dto) {
        updatePasswordService.changePassword(securityUser.getUsername(), dto);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(null);
    }

}
