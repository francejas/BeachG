package com.beachg.backend.dtos;

public record RentalUnitRequest(
        String type,
        String identifier,
        Double dailyPrice,
        Boolean isBlocked,
        Long resortId
) {
}
