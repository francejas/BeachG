package com.beachg.backend.controllers;

import com.beachg.backend.models.RentalUnit;
import com.beachg.backend.services.RentalUnitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rental-units")
@CrossOrigin("*")
public class RentalUnitController {

    private final RentalUnitService rentalUnitService;

    public RentalUnitController(RentalUnitService rentalUnitService) {
        this.rentalUnitService = rentalUnitService;
    }

    // POST: /api/rental-units/resort/1 -> Crea una carpa y la asigna al Resort 1
    @PostMapping("/resort/{idResort}")
    public ResponseEntity<RentalUnit> createRentalUnit(@RequestBody RentalUnit unit, @PathVariable Long idResort) {
        return new ResponseEntity<>(rentalUnitService.createRentalUnit(unit, idResort), HttpStatus.CREATED);
    }

    // GET: /api/rental-units -> Lista todo el inventario
    @GetMapping
    public ResponseEntity<List<RentalUnit>> getAllRentalUnits() {
        return ResponseEntity.ok(rentalUnitService.getAllRentalUnits());
    }

    // PATCH: /api/rental-units/1/price?newPrice=15000.50 -> Cambia el precio de la unidad 1
    @PatchMapping("/{id}/price")
    public ResponseEntity<RentalUnit> updatePrice(
            @PathVariable Long id,
            @RequestParam Double newPrice) {
        return ResponseEntity.ok(rentalUnitService.updatePrice(id, newPrice));
    }

    // PATCH: /api/rental-units/1/block?isBlocked=true -> Bloquea la unidad 1
    @PatchMapping("/{id}/block")
    public ResponseEntity<RentalUnit> updateBlockStatus(
            @PathVariable Long id,
            @RequestParam Boolean isBlocked) {
        return ResponseEntity.ok(rentalUnitService.updateBlockStatus(id, isBlocked));
    }
}