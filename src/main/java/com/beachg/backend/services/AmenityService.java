package com.beachg.backend.services;

import com.beachg.backend.exceptions.AmenityNotFoundException;
import com.beachg.backend.exceptions.InvalidAmenityException;
import com.beachg.backend.models.Amenity;
import com.beachg.backend.repositories.AmenityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AmenityService {

    @Autowired
    private AmenityRepository amenityRepository;

    public List<Amenity> getAllAmenities() {
        return amenityRepository.findAll();
    }

    public Amenity getAmenityById(Long id) {

        return amenityRepository.findById(id)
                .orElseThrow(() -> new AmenityNotFoundException(id));
    }

    public Amenity createAmenity(Amenity amenity) {

        validateAmenity(amenity);

        return amenityRepository.save(amenity);
    }

    public Amenity updateAmenity(Long id, Amenity amenity) {

        validateAmenity(amenity);

        Amenity existingAmenity = amenityRepository.findById(id)
                .orElseThrow(() -> new AmenityNotFoundException(id));

        existingAmenity.setName(amenity.getName());

        return amenityRepository.save(existingAmenity);
    }

    public void deleteAmenity(Long id) {

        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new AmenityNotFoundException(id));

        amenityRepository.delete(amenity);
    }

    private void validateAmenity(Amenity amenity) {

        if (amenity.getName() == null || amenity.getName().trim().isEmpty()) {
            throw new InvalidAmenityException("El nombre de la amenity no puede estar vacío");
        }

        if (amenity.getName().length() < 3) {
            throw new InvalidAmenityException("El nombre debe tener al menos 3 caracteres");
        }
    }
}
