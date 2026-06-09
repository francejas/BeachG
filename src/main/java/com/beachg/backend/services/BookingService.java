package com.beachg.backend.services;

// Import corregido a la carpeta correcta
import com.beachg.backend.dtos.booking.BookingRequest;
import com.beachg.backend.dtos.booking.BookingResponse;
import com.beachg.backend.dtos.guest.GuestSummaryResponse;
import com.beachg.backend.exceptions.booking.UnitNotAvailableException;
import com.beachg.backend.models.*;
import com.beachg.backend.repositories.BookingRepository;
import com.beachg.backend.repositories.ClientRepository;
import com.beachg.backend.repositories.GuestRepository;
import com.beachg.backend.repositories.RentalUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ClientRepository clientRepository;
    private final RentalUnitRepository rentalUnitRepository;
    private final GuestRepository guestRepository;

    // Cambio obligatorio: Debe retornar BookingResponse para que el controller funcione
    public BookingResponse createBooking(BookingRequest request) {

        // 1. Validar disponibilidad en la BD (Consulta personalizada)
        if (!bookingRepository.isUnitAvailable(request.rentalUnitId(), request.startDate(), request.endDate())) {
            throw new UnitNotAvailableException("La unidad seleccionada ya está ocupada en ese rango de fechas.");
        }

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
        List<Guest> invitadosGuardados = new ArrayList<>();

        if (request.guestNames() != null && !request.guestNames().isEmpty()) {

            for (String guestName : request.guestNames()) {

                Guest guest = new Guest();

                guest.setFullName(guestName);

                guest.setQrToken(UUID.randomUUID().toString());

                guest.setIsEntryValidated(false);

                guest.setBooking(savedBooking);

                // Cambio obligatorio: Guardamos en una lista temporal para poder mostrarlos en el DTO
                invitadosGuardados.add(guestRepository.save(guest));
            }
        }

        // Cambio obligatorio: Mapeo de la respuesta final al DTO
        List<GuestSummaryResponse> guestResponses = invitadosGuardados.stream()
                .map(g -> new GuestSummaryResponse(g.getIdGuest(), g.getFullName(), g.getIsEntryValidated()))
                .toList();

        return new BookingResponse(
                savedBooking.getId(),
                savedBooking.getStartDate(),
                savedBooking.getEndDate(),
                savedBooking.getTotalPrice(),
                savedBooking.getStatus(), // Sin el .name()
                savedBooking.getCreatedAt(), // Fecha de creación
                client.getIdClient(), // ID del cliente
                rentalUnit.getIdRentalUnit(), // ID de la unidad
                guestResponses // Lista de invitados
        );
    }


    // ACLARACION: Cree 2 metodos, uno publico y otro privado, el publico para reutilizarlo
    // en otra clase y el privado para esta, cosa que las responsabilidades esten bien separadas.
    public double getCalculatedPrice(LocalDate start, LocalDate end, Double dailyPrice) {
        return calculateTotalPrice(start, end, dailyPrice);
    }

    private double calculateTotalPrice(LocalDate start, LocalDate end, Double dailyPrice) {
        long days = ChronoUnit.DAYS.between(start, end);
        return days * dailyPrice;
    }
}