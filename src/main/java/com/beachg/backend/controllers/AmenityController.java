package com.beachg.backend.controllers;

import com.beachg.backend.dtos.amenity.AmenityRequest;
import com.beachg.backend.dtos.amenity.AmenityResponse;
import com.beachg.backend.services.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/amenities")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AmenityController {

    private final AmenityService amenityService;

    @GetMapping
    public ResponseEntity<List<AmenityResponse>> getAllAmenities() {
        return ResponseEntity.ok(amenityService.getAllAmenities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AmenityResponse> getAmenityById(@PathVariable Long id) {
        return ResponseEntity.ok(amenityService.getAmenityById(id));
    }

    @PostMapping
    public ResponseEntity<AmenityResponse> createAmenity(@RequestBody AmenityRequest request) {
        return new ResponseEntity<>(amenityService.createAmenity(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AmenityResponse> updateAmenity(@PathVariable Long id, @RequestBody AmenityRequest request) {
        return ResponseEntity.ok(amenityService.updateAmenity(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAmenity(@PathVariable Long id) {
        amenityService.deleteAmenity(id);
        return ResponseEntity.noContent().build();
    }
}