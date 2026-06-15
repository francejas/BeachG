package com.beachg.backend.controllers;

import com.beachg.backend.dtos.rentalunit.RentalUnitRequest;
import com.beachg.backend.dtos.rentalunit.RentalUnitResponse;
import com.beachg.backend.services.RentalUnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rental-units")
@RequiredArgsConstructor
public class RentalUnitController {

    private final RentalUnitService rentalUnitService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<RentalUnitResponse> createRentalUnit(@RequestBody RentalUnitRequest request) {
        return new ResponseEntity<>(rentalUnitService.createRentalUnit(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RentalUnitResponse>> getAllRentalUnits() {
        return ResponseEntity.ok(rentalUnitService.getAllRentalUnits());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/price")
    public ResponseEntity<RentalUnitResponse> updatePrice(
            @PathVariable Long id,
            @RequestParam Double newPrice) {
        return ResponseEntity.ok(rentalUnitService.updatePrice(id, newPrice));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/block")
    public ResponseEntity<RentalUnitResponse> updateBlockStatus(
            @PathVariable Long id,
            @RequestParam Boolean isBlocked) {
        return ResponseEntity.ok(rentalUnitService.updateBlockStatus(id, isBlocked));
    }
}