package com.beachg.backend.controllers;

import com.beachg.backend.dtos.guest.GuestValidationResponse;
import com.beachg.backend.services.GuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guests")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    @PostMapping("/validate/{token}")
    public ResponseEntity<GuestValidationResponse> validateGuestEntry(@PathVariable String token) {
        GuestValidationResponse response = guestService.validateGuestEntry(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate/dni/{dni}")
    public ResponseEntity<GuestValidationResponse> validateGuestEntryByDni(@PathVariable String dni) {
        GuestValidationResponse response = guestService.validateGuestEntryByDni(dni);
        return ResponseEntity.ok(response);
    }
}
