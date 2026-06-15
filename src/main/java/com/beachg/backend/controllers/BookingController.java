package com.beachg.backend.controllers;

import com.beachg.backend.dtos.booking.BookingRequest;
import com.beachg.backend.dtos.booking.BookingResponse;
import com.beachg.backend.services.BookingService;
import com.beachg.backend.services.MercadoPagoService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final MercadoPagoService mercadoPagoService;

    @Value("${NGROK_BASE_URL}")
    private String baseUrl;

    @Value("${FRONTEND_URL}")
    private String frontendUrl;

    // 1a. Reserva WEB — cualquier usuario autenticado
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.createBooking(request);

        String paymentUrl = mercadoPagoService.createPaymentPreference(
                "Reserva BeachG",
                booking.totalPrice(),
                1,
                baseUrl + "/api/bookings/success",
                baseUrl + "/api/bookings/pending",
                baseUrl + "/api/bookings/failure",
                booking.id()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "booking", booking,
                "paymentUrl", paymentUrl
        ));
    }

    // 1b. Reserva PRESENCIAL (walk-in) — solo ADMIN del balneario
    @PostMapping("/walkin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createWalkInBooking(@RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.createBooking(request);
        bookingService.confirmBookingPayment(booking.id());
        BookingResponse confirmed = bookingService.getBookingById(booking.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Reserva presencial confirmada. Código/s QR generados.",
                "booking", confirmed
        ));
    }

    // 2. Ver todas las reservas (Panel del Administrador)
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // 3. Ver las reservas de un cliente específico
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(bookingService.getBookingsByClientId(clientId));
    }

    // 4. Ver el detalle de una reserva específica
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // 5. Cancelar reserva (ADMIN)
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    // ==========================================
    // ENDPOINTS DE RETORNO DE MERCADO PAGO
    // ==========================================

    @GetMapping("/success")
    public void handleSuccess(
            @RequestParam("collection_id") String collectionId,
            @RequestParam("status") String mpStatus,
            @RequestParam("external_reference") String externalReference,
            HttpServletResponse response) throws IOException {

        Long bookingId = Long.parseLong(externalReference);
        bookingService.confirmBookingPayment(bookingId);
        response.sendRedirect(frontendUrl + "/payment/success");
    }

    @GetMapping("/pending")
    public void handlePending(HttpServletResponse response) throws IOException {
        response.sendRedirect(frontendUrl + "/payment/pending");
    }

    @GetMapping("/failure")
    public void handleFailure(HttpServletResponse response) throws IOException {
        response.sendRedirect(frontendUrl + "/payment/failure");
    }
}
