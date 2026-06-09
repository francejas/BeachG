package com.beachg.backend.services;

import com.beachg.backend.dtos.BookingRequest;
import com.beachg.backend.models.*;
import com.beachg.backend.repositories.BookingRepository;
import com.beachg.backend.repositories.ClientRepository;
import com.beachg.backend.repositories.GuestRepository;
import com.beachg.backend.repositories.RentalUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ClientRepository clientRepository;
    private final RentalUnitRepository rentalUnitRepository;
    private final GuestRepository guestRepository;

    public Booking createBooking(BookingRequest request) {

        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        RentalUnit rentalUnit = rentalUnitRepository.findById(request.rentalUnitId())
                .orElseThrow(() -> new RuntimeException("Unidad no encontrada"));

        Booking booking = new Booking();

        booking.setStartDate(request.startDate());
        booking.setEndDate(request.endDate());
        booking.setClient(client);
        booking.setRentalUnit(rentalUnit);
        booking.setStatus(Status.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        long days = request.endDate().toEpochDay() - request.startDate().toEpochDay();

        booking.setTotalPrice(days * rentalUnit.getDailyPrice());

        Booking savedBooking = bookingRepository.save(booking);

        // CREACIÓN DE GUESTS

        if (request.guestNames() != null && !request.guestNames().isEmpty()) {

            for (String guestName : request.guestNames()) {

                Guest guest = new Guest();

                guest.setFullName(guestName);

                guest.setQrToken(UUID.randomUUID().toString());

                guest.setIsEntryValidated(false);

                guest.setBooking(savedBooking);

                guestRepository.save(guest);
            }
        }

        return savedBooking;
    }
}