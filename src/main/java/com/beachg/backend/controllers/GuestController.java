package com.beachg.backend.controllers;

import com.beachg.backend.dtos.guest.GuestValidationResponse;
import com.beachg.backend.services.GuestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guests")
@RequiredArgsConstructor
@Tag(name = "Huéspedes", description = "Validación de ingreso por QR o DNI")
public class GuestController {

    private final GuestService guestService;

    @PostMapping("/validate/{token}")
    @Operation(summary = "Validar ingreso por token QR", description = "Público. Marca el ingreso del huésped y devuelve sus datos.")
    public ResponseEntity<GuestValidationResponse> validateGuestEntry(@PathVariable String token) {
        return ResponseEntity.ok(guestService.validateGuestEntry(token));
    }

    @PostMapping("/validate/dni/{dni}")
    @Operation(summary = "Validar ingreso por DNI", description = "Público. Alternativa al QR para validar ingreso.")
    public ResponseEntity<GuestValidationResponse> validateGuestEntryByDni(@PathVariable String dni) {
        return ResponseEntity.ok(guestService.validateGuestEntryByDni(dni));
    }
}
