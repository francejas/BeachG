package com.beachg.backend.services;

import com.beachg.backend.dtos.amenity.AmenityResponse;
import com.beachg.backend.dtos.rentalunit.RentalUnitResponse;
import com.beachg.backend.dtos.resort.ResortRequest;
import com.beachg.backend.dtos.resort.ResortResponse;
import com.beachg.backend.exceptions.resort.ResortInvalidRegisterException;
import com.beachg.backend.exceptions.resort.ResortNotFoundException;
import com.beachg.backend.models.Amenity;
import com.beachg.backend.models.Resort;
import com.beachg.backend.repositories.AmenityRepository;
import com.beachg.backend.repositories.ResortRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResortService {

    private final ResortRepository resortRepository;
    private final AmenityRepository amenityRepository;

    public List<ResortResponse> getAll() {
        return resortRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ResortResponse getResortById(Long id) {
        Resort resort = resortRepository.findById(id)
                .orElseThrow(() -> new ResortNotFoundException("Resort with id " + id + " not found"));

        return mapToResponse(resort);
    }

    public ResortResponse registerResort(ResortRequest request) {
        if (resortRepository.findByName(request.name()).isPresent()) {
            throw new ResortInvalidRegisterException("Resort with name " + request.name() + " already exists");
        }

        Resort resort = new Resort();
        resort.setName(request.name());
        resort.setLocation(request.location());
        resort.setAdminEmail(request.adminEmail());
        resort.setPasswordHash(request.password());
        resort.setCoverPhotoUrl(request.coverPhotoUrl());
        resort.setActive(true);

        // Buscar y asignar amenities si enviaron la lista de IDs (notar que usamos request.aminityIds())
        if (request.aminityIds() != null && !request.aminityIds().isEmpty()) {
            List<Amenity> amenities = amenityRepository.findAllById(request.aminityIds());
            resort.setAmenities(amenities);
        }

        return mapToResponse(resortRepository.save(resort));
    }

    public ResortResponse updateResort(Long resortId, ResortRequest request) {
        Resort resort = resortRepository.findById(resortId)
                .orElseThrow(() -> new ResortNotFoundException("Resort with id " + resortId + " not found"));

        resort.setName(request.name());
        resort.setLocation(request.location());
        resort.setAdminEmail(request.adminEmail());
        resort.setCoverPhotoUrl(request.coverPhotoUrl());

        if (request.aminityIds() != null) {
            List<Amenity> amenities = amenityRepository.findAllById(request.aminityIds());
            resort.setAmenities(amenities);
        }

        return mapToResponse(resortRepository.save(resort));
    }

    public ResortResponse toInactive(Long id) {
        Resort resort = resortRepository.findById(id).orElseThrow(() -> new ResortNotFoundException("Resort not found"));
        resort.setActive(false);
        return mapToResponse(resortRepository.save(resort));
    }

    public ResortResponse toActive(Long id) {
        Resort resort = resortRepository.findById(id).orElseThrow(() -> new ResortNotFoundException("Resort not found"));
        resort.setActive(true);
        return mapToResponse(resortRepository.save(resort));
    }

    // MAPPER interno: Se encarga de transformar las listas anidadas de Resort a DTOs de Amenity y RentalUnit
    private ResortResponse mapToResponse(Resort r) {
        List<AmenityResponse> amenities = (r.getAmenities() != null) ? r.getAmenities().stream()
                                                                       .map(a -> new AmenityResponse(a.getIdAmenity(), a.getName()))
                                                                       .toList() : List.of();

        List<RentalUnitResponse> units = (r.getRentalUnits() != null) ? r.getRentalUnits().stream()
                                                                        .map(u -> new RentalUnitResponse(u.getIdRentalUnit(), u.getType(), u.getIdentifier(), u.getDailyPrice(), u.getIsBlocked()))
                                                                        .toList() : List.of();

        return new ResortResponse(
                r.getIdResort(),
                r.getName(),
                r.getLocation(),
                r.getAdminEmail(),
                r.getCoverPhotoUrl(),
                amenities,
                units
        );
    }
}