package com.beachg.backend.dtos.booking;

import java.time.LocalDate;
import java.util.List;

public record BookingRequest(
        LocalDate startDate,
        LocalDate endDate,
        Long clientId, // En caso presencial será el ID del "Cliente Mostrador"
        Long rentalUnitId,
        List<GuestRequest> guests,
        String walkInName, // <-- Nuevo campo opcional
        String walkInDni,   // <-- Nuevo campo opcional
        Boolean isWalkIn   // <--- NUEVO CAMPO QUE MANDA EL FRONTEND
) {
}
