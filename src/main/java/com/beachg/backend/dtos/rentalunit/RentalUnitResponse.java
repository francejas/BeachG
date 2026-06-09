package com.beachg.backend.dtos.rentalunit;

public record RentalUnitResponse(
        Long idRentalUnit,
        String type,
        String identifier,
        Double dailyPrice,
        Boolean isBlocked
) {
}
