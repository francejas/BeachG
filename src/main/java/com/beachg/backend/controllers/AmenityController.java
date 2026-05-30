package com.beachg.backend.controllers;

import com.beachg.backend.models.Amenity;
import com.beachg.backend.services.AmenityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/amenities")
public class AmenityController {

    @Autowired
    private AmenityService amenityService;

    @GetMapping
    public List<Amenity> getAllAmenities() {

        return amenityService.getAllAmenities();
    }

    @GetMapping("/{id}")
    public Amenity getAmenityById(@PathVariable Long id) {

        return amenityService.getAmenityById(id);
    }

    @PostMapping
    public Amenity createAmenity(
            @RequestBody Amenity amenity) {

        return amenityService.createAmenity(amenity);
    }

    @PutMapping("/{id}")
    public Amenity updateAmenity(
            @PathVariable Long id,
            @RequestBody Amenity amenity) {

        return amenityService.updateAmenity(id, amenity);
    }

    @DeleteMapping("/{id}")
    public void deleteAmenity(@PathVariable Long id) {

        amenityService.deleteAmenity(id);
    }
}