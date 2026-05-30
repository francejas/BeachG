package com.beachg.backend.controllers;

import com.beachg.backend.dtos.RentalUnitRequest;
import com.beachg.backend.dtos.RentalUnitResponse;
import com.beachg.backend.services.RentalUnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rental-units")
@CrossOrigin("*")
@RequiredArgsConstructor
public class RentalUnitController {

    private final RentalUnitService rentalUnitService;

    @PostMapping
    public ResponseEntity<RentalUnitResponse> createRentalUnit(@RequestBody RentalUnitRequest request) {
        return new ResponseEntity<>(rentalUnitService.createRentalUnit(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RentalUnitResponse>> getAllRentalUnits() {
        return ResponseEntity.ok(rentalUnitService.getAllRentalUnits());
    }

    @PatchMapping("/{id}/price")
    public ResponseEntity<RentalUnitResponse> updatePrice(
            @PathVariable Long id,
            @RequestParam Double newPrice) {
        return ResponseEntity.ok(rentalUnitService.updatePrice(id, newPrice));
    }

    @PatchMapping("/{id}/block")
    public ResponseEntity<RentalUnitResponse> updateBlockStatus(
            @PathVariable Long id,
            @RequestParam Boolean isBlocked) {
        return ResponseEntity.ok(rentalUnitService.updateBlockStatus(id, isBlocked));
    }
}