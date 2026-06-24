package com.beachg.backend.services;

import com.beachg.backend.dtos.guest.GuestValidationResponse;
import com.beachg.backend.exceptions.guest.BookingNotInValidPeriodException;
import com.beachg.backend.exceptions.guest.BookingNotPaidException;
import com.beachg.backend.exceptions.guest.GuestAlreadyEnteredException;
import com.beachg.backend.exceptions.guest.GuestNotFoundException;
import com.beachg.backend.models.Booking;
import com.beachg.backend.models.Guest;
import com.beachg.backend.models.Status;
import com.beachg.backend.repositories.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GuestService {

    private final GuestRepository guestRepository;

    private static final DateTimeFormatter DMY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Transactional
    public GuestValidationResponse validateGuestEntry(String token) {
        Guest guest = guestRepository.findByQrToken(token)
                .orElseThrow(() -> new GuestNotFoundException("El código ingresado no existe o es incorrecto."));

        if (guest.getBooking().getStatus() != Status.CONFIRMED) {
            throw new BookingNotPaidException("La reserva asociada a este código aún figura como " + guest.getBooking().getStatus() + ". Debe abonarse antes de ingresar.");
        }

        checkBookingPeriod(guest.getBooking());

        if (guest.getIsEntryValidated()) {
            throw new GuestAlreadyEnteredException("ALERTA: Este código ya registró su ingreso al balneario.");
        }

        return confirmEntry(guest);
    }

    @Transactional
    public GuestValidationResponse validateGuestEntryByDni(String dni) {
        List<Guest> guests = guestRepository.findConfirmedByDni(dni);

        if (guests.isEmpty()) {
            throw new GuestNotFoundException("No se encontró una reserva confirmada con el DNI ingresado.");
        }

        LocalDate today = LocalDate.now();

        // Solo huéspedes cuya reserva esté vigente hoy (inicio <= hoy <= fin).
        List<Guest> active = guests.stream()
                .filter(g -> !today.isBefore(g.getBooking().getStartDate())
                        && !today.isAfter(g.getBooking().getEndDate()))
                .toList();

        if (active.isEmpty()) {
            // Hay reservas con ese DNI, pero ninguna vigente hoy. Mensaje según próxima/última.
            Optional<Guest> future = guests.stream()
                    .filter(g -> today.isBefore(g.getBooking().getStartDate()))
                    .min(Comparator.comparing(g -> g.getBooking().getStartDate()));
            if (future.isPresent()) {
                throw new BookingNotInValidPeriodException(
                        "La reserva con ese DNI todavía no comenzó. El ingreso se habilita el "
                                + future.get().getBooking().getStartDate().format(DMY) + ".");
            }
            Guest latest = guests.stream()
                    .max(Comparator.comparing(g -> g.getBooking().getEndDate()))
                    .orElseThrow();
            throw new BookingNotInValidPeriodException(
                    "La reserva con ese DNI venció el " + latest.getBooking().getEndDate().format(DMY)
                            + ". El ingreso ya no está disponible.");
        }

        Guest guest = active.stream()
                .filter(g -> !g.getIsEntryValidated())
                .findFirst()
                .orElseThrow(() -> new GuestAlreadyEnteredException("ALERTA: El ingreso para este DNI ya fue registrado."));

        return confirmEntry(guest);
    }

    private GuestValidationResponse confirmEntry(Guest guest) {
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

    /** Rechaza el ingreso si hoy está fuera de la ventana [startDate, endDate] de la reserva. */
    private void checkBookingPeriod(Booking booking) {
        LocalDate today = LocalDate.now();
        if (today.isBefore(booking.getStartDate())) {
            throw new BookingNotInValidPeriodException(
                    "La reserva todavía no comenzó. El ingreso se habilita el "
                            + booking.getStartDate().format(DMY) + ".");
        }
        if (today.isAfter(booking.getEndDate())) {
            throw new BookingNotInValidPeriodException(
                    "La reserva venció el " + booking.getEndDate().format(DMY)
                            + ". El ingreso ya no está disponible.");
        }
    }
}
