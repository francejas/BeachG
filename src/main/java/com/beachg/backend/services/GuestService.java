package com.beachg.backend.services;

import com.beachg.backend.dtos.guest.GuestValidationResponse;
import com.beachg.backend.exceptions.guest.BookingNotPaidException;
import com.beachg.backend.exceptions.guest.GuestAlreadyEnteredException;
import com.beachg.backend.exceptions.guest.GuestNotFoundException;
import com.beachg.backend.models.Guest;
import com.beachg.backend.models.Status;
import com.beachg.backend.repositories.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GuestService {

    private final GuestRepository guestRepository;

    public GuestValidationResponse validateGuestEntry(String token) {
        // 1. Verificar si el token existe
        Guest guest = guestRepository.findByQrToken(token)
                .orElseThrow(() -> new GuestNotFoundException("El código ingresado no existe o es incorrecto."));

        // 2. Verificar la regla de oro: ¿Ya ingresó previamente?
        if (guest.getIsEntryValidated()) {
            throw new GuestAlreadyEnteredException("ALERTA: Este código ya registró su ingreso al balneario.");
        }

        // 3. Verificar si la reserva ya fue pagada (Estado CONFIRMED)
        if (guest.getBooking().getStatus() != Status.CONFIRMED) {
            throw new BookingNotPaidException("La reserva asociada a este código aún figura como " + guest.getBooking().getStatus() + ". Debe abonarse antes de ingresar.");
        }

        // 4. Todo está OK: Registrar el ingreso y guardar en BD
        guest.setIsEntryValidated(true);
        guestRepository.save(guest);

        // 5. Devolver la información para el empleado de seguridad
        String unitIdentifier = guest.getBooking().getRentalUnit().getIdentifier();

        return new GuestValidationResponse(
                guest.getIdGuest(),
                guest.getFullName(),
                unitIdentifier,
                "¡Acceso Permitido! Dirigirse a la unidad: " + unitIdentifier
        );
    }
}