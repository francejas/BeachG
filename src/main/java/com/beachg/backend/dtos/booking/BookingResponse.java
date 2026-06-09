package com.beachg.backend.dtos.booking;

import com.beachg.backend.dtos.guest.GuestSummaryResponse;
import com.beachg.backend.models.Status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record BookingResponse(
        Long id,
        LocalDate startDate,
        LocalDate endDate,
        Double totalPrice,
        Status status,
        LocalDateTime createdAt,
        Long idClient,
        Long rentalUnitId,
        List<GuestSummaryResponse> guests
) {
}
