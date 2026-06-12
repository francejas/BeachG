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
import org.springframework.scheduling.annotation.Scheduled;
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

        // =========================================================
        // --- LÓGICA DE ESTADO SEGÚN TIPO DE RESERVA (WALK-IN) ---
        // =========================================================
        if (request.isWalkIn() != null && request.isWalkIn()) {
            booking.setStatus(Status.CONFIRMED); // Presencial: ya pagó en caja
        } else {
            booking.setStatus(Status.PENDING); // Web: espera a Mercado Pago
        }
        // =========================================================

        booking.setCreatedAt(LocalDateTime.now());

        // --- ASIGNAR LOS DATOS DE MOSTRADOR ---
        booking.setWalkInName(request.walkInName());
        booking.setWalkInDni(request.walkInDni());
        // --------------------------------------

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

                // Guardamos en una lista temporal para poder mostrarlos en el DTO
                invitadosGuardados.add(guestRepository.save(guest));
            }
        }

        // Mapeo de la respuesta final al DTO
        List<GuestSummaryResponse> guestResponses = invitadosGuardados.stream()
                .map(g -> new GuestSummaryResponse(g.getIdGuest(), g.getFullName(), g.getIsEntryValidated()))
                .toList();

        return new BookingResponse(
                savedBooking.getId(),
                savedBooking.getStartDate(),
                savedBooking.getEndDate(),
                savedBooking.getTotalPrice(),
                savedBooking.getStatus(),
                savedBooking.getCreatedAt(),
                client.getIdClient(),
                rentalUnit.getIdRentalUnit(),
                guestResponses,
                savedBooking.getWalkInName(),
                savedBooking.getWalkInDni()
        );
    }


    // ACLARACION: El private es para esta clase, el public es para usarlo en
    // cualquier parte del proyecto si llegara a ser necesario.
    public double getCalculatedPrice(LocalDate start, LocalDate end, Double dailyPrice) {
        return calculateTotalPrice(start, end, dailyPrice);
    }

    private double calculateTotalPrice(LocalDate start, LocalDate end, Double dailyPrice) {
        long days = ChronoUnit.DAYS.between(start, end);
        return days * dailyPrice;
    }


    // 2. Obtener todas las reservas del sistema (Admin)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToBookingResponse)
                .toList();
    }

    // 3. Obtener reservas por ID de Cliente (Cliente)
    public List<BookingResponse> getBookingsByClientId(Long clientId) {
        return bookingRepository.findByClientId(clientId).stream()
                .map(this::mapToBookingResponse)
                .toList();
    }

    // Obtener el detalle completo de una reserva específica por su ID
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con el ID: " + id));
        return mapToBookingResponse(booking);
    }

    // Método helper privado para mapear la entidad Booking al DTO BookingResponse
    private BookingResponse mapToBookingResponse(Booking booking) {
        List<GuestSummaryResponse> guestResponses = booking.getGuests() != null ?
                booking.getGuests().stream()
                .map(g -> new GuestSummaryResponse(g.getIdGuest(), g.getFullName(), g.getIsEntryValidated()))
                .toList() : new ArrayList<>();

        return new BookingResponse(
                booking.getId(),
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getTotalPrice(),
                booking.getStatus(),
                booking.getCreatedAt(),
                booking.getClient().getIdClient(),
                booking.getRentalUnit().getIdRentalUnit(),
                guestResponses,
                booking.getWalkInName(), // <-- Agregado
                booking.getWalkInDni()   // <-- Agregado
        );
    }

    public void confirmBookingPayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        booking.setStatus(Status.CONFIRMED);

        // Guardamos los cambios
        bookingRepository.save(booking);
    }


    // ==========================================
    // TAREA AUTOMÁTICA DE LIMPIEZA DE RESERVAS
    // ==========================================

    /**
     * Este método se ejecuta automáticamente cada 1 hora exacto.
     * Busca las reservas con más de 24hs pendientes y las cancela.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void cancelExpiredBookings() {
        // 1. Calculamos qué hora era hace exactamente 24 horas
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);

        // 2. Buscamos las reservas vencidas usando el método nuevo del repositorio
        List<Booking> expiredBookings = bookingRepository.findExpiredPendingBookings(twentyFourHoursAgo);

        // 3. Si encontramos alguna, le cambiamos el estado a CANCELED y la guardamos
        if (!expiredBookings.isEmpty()) {
            for (Booking booking : expiredBookings) {
                booking.setStatus(Status.CANCELED); // Usa el Status de tu Enum
            }

            // saveAll es mucho más rápido que hacer un save() por cada reserva en un bucle
            bookingRepository.saveAll(expiredBookings);

            System.out.println("Limpieza automática: Se cancelaron " + expiredBookings.size() + " reservas por falta de pago.");
        }
    }



}