package com.beachg.backend.dtos.rentalunit;
import com.beachg.backend.models.UnitType;
public record RentalUnitResponse(
        Long idRentalUnit,
        UnitType type,
        String identifier,
        Double dailyPrice,
        Boolean isBlocked
) {
}
