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
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GuestService {

    private final GuestRepository guestRepository;

    @Transactional
    public GuestValidationResponse validateGuestEntry(String token) {
        Guest guest = guestRepository.findByQrToken(token)
                .orElseThrow(() -> new GuestNotFoundException("El código ingresado no existe o es incorrecto."));

        // Primero verificar que la reserva esté paga
        if (guest.getBooking().getStatus() != Status.CONFIRMED) {
            throw new BookingNotPaidException("La reserva asociada a este código aún figura como " + guest.getBooking().getStatus() + ". Debe abonarse antes de ingresar.");
        }

        // Luego verificar si el QR ya fue usado
        if (guest.getIsEntryValidated()) {
            throw new GuestAlreadyEnteredException("ALERTA: Este código ya registró su ingreso al balneario.");
        }

        guest.setIsEntryValidated(true);
        guestRepository.save(guest);

        String unitIdentifier = guest.getBooking().getRentalUnit().getIdentifier();

        return new GuestValidationResponse(
                guest.getIdGuest(),
                guest.getFullName(),
                unitIdentifier,
                "¡Acceso Permitido! Dirigirse a la unidad: " + unitIdentifier
        );
    }
}
