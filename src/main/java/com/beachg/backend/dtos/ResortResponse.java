package com.beachg.backend.dtos;

import java.util.List;

public record ResortResponse(
        Long idResort,
        String name,
        String location,
        String adminEmail,
        String coverPhotoUrl,
        List<AmenityResponse> amenities,
        List<RentalUnitResponse> rentalUnits
) {
}
