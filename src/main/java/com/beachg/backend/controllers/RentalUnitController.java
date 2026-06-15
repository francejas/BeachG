package com.beachg.backend.controllers;

import com.beachg.backend.dtos.rentalunit.RentalUnitRequest;
import com.beachg.backend.dtos.rentalunit.RentalUnitResponse;
import com.beachg.backend.services.RentalUnitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rental-units")
@RequiredArgsConstructor
@Tag(name = "Unidades de alquiler", description = "Gestión de carpas y sombrillas del balneario")
public class RentalUnitController {

    private final RentalUnitService rentalUnitService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Crear unidad de alquiler (Admin)", description = "Crea una carpa o sombrilla asociada al balneario.")
    public ResponseEntity<RentalUnitResponse> createRentalUnit(@RequestBody RentalUnitRequest request) {
        return new ResponseEntity<>(rentalUnitService.createRentalUnit(request), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Listar todas las unidades")
    public ResponseEntity<List<RentalUnitResponse>> getAllRentalUnits() {
        return ResponseEntity.ok(rentalUnitService.getAllRentalUnits());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/price")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Actualizar precio de una unidad (Admin)")
    public ResponseEntity<RentalUnitResponse> updatePrice(
            @PathVariable Long id,
            @RequestParam Double newPrice) {
        return ResponseEntity.ok(rentalUnitService.updatePrice(id, newPrice));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/block")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Bloquear / desbloquear unidad (Admin)")
    public ResponseEntity<RentalUnitResponse> updateBlockStatus(
            @PathVariable Long id,
            @RequestParam Boolean isBlocked) {
        return ResponseEntity.ok(rentalUnitService.updateBlockStatus(id, isBlocked));
    }
}
