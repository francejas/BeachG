package com.beachg.backend.dtos.booking;

import java.time.LocalDate;

public record BookingRequest(
        LocalDate startDate,
        LocalDate endDate,
        Long clientId,
        Long rentalUnitId
) {
}
