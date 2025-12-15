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
        service.createSwap(SecurityUser.getUsername(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{swapId}/status")
    public ResponseEntity<Swap> updateSwapStatus(
            @AuthenticationPrincipal SecurityUser SecurityUser,
            @PathVariable String swapId,
            @RequestParam String status
    ) {
        try {
            Swap updatedSwap = service.updateSwapStatus(
                swapId, 
                status, 
                SecurityUser.getUsername()
            );
            return ResponseEntity.ok(updatedSwap);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}