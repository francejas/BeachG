package com.beachg.backend.dtos;

import java.time.LocalDate;
import java.util.List;

public record BookingRequest(
        LocalDate startDate,
        LocalDate endDate,
        Long clientId,
        Long rentalUnitId,
        List<String> guestNames
) {
}
