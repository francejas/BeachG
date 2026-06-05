package com.beachg.backend.services;

import com.beachg.backend.dtos.amenity.AmenityRequest;
import com.beachg.backend.dtos.amenity.AmenityResponse;
import com.beachg.backend.exceptions.amenity.AmenityNotFoundException;
import com.beachg.backend.exceptions.amenity.InvalidAmenityException;
import com.beachg.backend.models.Amenity;
import com.beachg.backend.repositories.AmenityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AmenityService {

    private final AmenityRepository amenityRepository;

    public List<AmenityResponse> getAllAmenities() {
        return amenityRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList(); //
    }

    public AmenityResponse getAmenityById(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new AmenityNotFoundException("Amenity con id " + id + " no encontrada"));
        return mapToResponse(amenity);
    }

    public AmenityResponse createAmenity(AmenityRequest request) {
        validateAmenity(request);
        Amenity amenity = new Amenity();
        amenity.setName(request.name());

        return mapToResponse(amenityRepository.save(amenity));
    }

    public AmenityResponse updateAmenity(Long id, AmenityRequest request) {
        validateAmenity(request);
        Amenity existingAmenity = amenityRepository.findById(id)
                .orElseThrow(() -> new AmenityNotFoundException("Amenity con id " + id + " no encontrada"));

        existingAmenity.setName(request.name());
        return mapToResponse(amenityRepository.save(existingAmenity));
    }

    public void deleteAmenity(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new AmenityNotFoundException("Amenity con id " + id + " no encontrada"));
        amenityRepository.delete(amenity);
    }

    private void validateAmenity(AmenityRequest request) {
        if (request.name() == null || request.name().trim().isEmpty()) {
            throw new InvalidAmenityException("El nombre de la amenity no puede estar vacío");
        }
        if (request.name().length() < 3) {
            throw new InvalidAmenityException("El nombre debe tener al menos 3 caracteres");
        }
    }

    // MAPPER interno
    private AmenityResponse mapToResponse(Amenity amenity) {
        return new AmenityResponse(amenity.getIdAmenity(), amenity.getName());
    }
}