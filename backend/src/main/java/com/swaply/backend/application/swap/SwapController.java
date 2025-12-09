package com.swaply.backend.application.swap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.swaply.backend.application.swap.dto.SwapDTO;
import com.swaply.backend.application.swap.service.SwapService;
import com.swaply.backend.config.security.SecurityUser;
import com.swaply.backend.shared.UserCRUD.Model.Swap;



@RestController
@RequestMapping("/api/swap")
public class SwapController {

    private final SwapService service;

    public SwapController(SwapService service) {
        this.service = service;
    }

    @PatchMapping("/request")
    public ResponseEntity<Swap> request(@AuthenticationPrincipal SecurityUser SecurityUser, @RequestBody SwapDTO dto) {
        Swap newSwap = service.createSwap(SecurityUser.getUsername(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newSwap); //solo para testeo
       // return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
