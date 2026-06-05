package com.beachg.backend.dtos.booking;

import java.time.LocalDate;

public record BookingSummaryResponse(Long idBooking,
                                     LocalDate starDate,
                                     LocalDate endDate,
                                     Double totalPrice,
                                     String status,
                                     String rentalUnitIdentifier) {
}
