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

import java.util.List;

@Service
@RequiredArgsConstructor
public class GuestService {

    private final GuestRepository guestRepository;

    @Transactional
    public GuestValidationResponse validateGuestEntry(String token) {
        Guest guest = guestRepository.findByQrToken(token)
                .orElseThrow(() -> new GuestNotFoundException("El código ingresado no existe o es incorrecto."));

        if (guest.getBooking().getStatus() != Status.CONFIRMED) {
            throw new BookingNotPaidException("La reserva asociada a este código aún figura como " + guest.getBooking().getStatus() + ". Debe abonarse antes de ingresar.");
        }

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

    @Transactional
    public GuestValidationResponse validateGuestEntryByDni(String dni) {
        List<Guest> guests = guestRepository.findConfirmedByDni(dni);

        if (guests.isEmpty()) {
            throw new GuestNotFoundException("No se encontró una reserva confirmada con el DNI ingresado.");
        }

        Guest guest = guests.stream()
                .filter(g -> !g.getIsEntryValidated())
                .findFirst()
                .orElseThrow(() -> new GuestAlreadyEnteredException("ALERTA: El ingreso para este DNI ya fue registrado."));

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
