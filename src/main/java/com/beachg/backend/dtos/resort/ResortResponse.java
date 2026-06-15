package com.beachg.backend.dtos.resort;

import com.beachg.backend.dtos.amenity.AmenityResponse;
import com.beachg.backend.dtos.rentalunit.RentalUnitResponse;

import java.util.List;

public record ResortResponse(
        Long idResort,
        String name,
        String location,
        String adminEmail,
        String coverPhotoUrl,
        String description,
        List<AmenityResponse> amenities,
        List<RentalUnitResponse> rentalUnits
) {
}
