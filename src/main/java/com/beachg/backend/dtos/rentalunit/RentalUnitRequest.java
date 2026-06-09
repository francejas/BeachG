package com.beachg.backend.dtos.rentalunit;

import com.beachg.backend.models.UnitType;

public record RentalUnitRequest(
        UnitType type,
        String identifier,
        Double dailyPrice,
        Boolean isBlocked,
        Long resortId
) {
}
