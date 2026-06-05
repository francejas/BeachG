package com.beachg.backend.dtos.client;

import com.beachg.backend.dtos.booking.BookingSummaryResponse;
import com.beachg.backend.models.Booking;

import java.util.List;

public record ClientResponse(
        Long idClient,
        String firstName,
        String lastName,
        String email,
        String phone,
        List<BookingSummaryResponse> bookings //lista anidada segura
) {
}