package com.beachg.backend.controllers;

import com.beachg.backend.dtos.guest.GuestValidationResponse;
import com.beachg.backend.services.GuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guests")
@CrossOrigin("*")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    // Recibe el token directamente por la URL: /api/guests/validate/GUEST-1234
    @PostMapping("/validate/{token}")
    public ResponseEntity<GuestValidationResponse> validateGuestEntry(@PathVariable String token) {
        GuestValidationResponse response = guestService.validateGuestEntry(token);
        return ResponseEntity.ok(response);
    }
}
