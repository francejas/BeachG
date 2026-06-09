package com.beachg.backend.dtos.booking;

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
