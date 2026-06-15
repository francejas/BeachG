package com.beachg.backend.controllers;

import com.beachg.backend.dtos.booking.BookingRequest;
import com.beachg.backend.dtos.booking.BookingResponse;
import com.beachg.backend.services.BookingService;
import com.beachg.backend.services.MercadoPagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Reservas", description = "Creación, consulta y cancelación de reservas. Incluye callbacks de MercadoPago.")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingService bookingService;
    private final MercadoPagoService mercadoPagoService;

    @Value("${NGROK_BASE_URL}")
    private String baseUrl;

    @Value("${FRONTEND_URL}")
    private String frontendUrl;

    @PostMapping
    @Operation(summary = "Crear reserva web", description = "Crea la reserva y devuelve la URL de pago de MercadoPago.")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.createBooking(request);
        String paymentUrl = mercadoPagoService.createPaymentPreference(
                "Reserva BeachG", booking.totalPrice(), 1,
                baseUrl + "/api/bookings/success",
                baseUrl + "/api/bookings/pending",
                baseUrl + "/api/bookings/failure",
                booking.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("booking", booking, "paymentUrl", paymentUrl));
    }

    @PostMapping("/walkin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear reserva presencial (Admin)", description = "Crea y confirma automáticamente la reserva sin pasar por MercadoPago.")
    public ResponseEntity<?> createWalkInBooking(@RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.createBooking(request);
        bookingService.confirmBookingPayment(booking.id());
        BookingResponse confirmed = bookingService.getBookingById(booking.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Reserva presencial confirmada. Código/s QR generados.", "booking", confirmed));
    }

    @GetMapping
    @Operation(summary = "Listar todas las reservas (Admin)")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Reservas de un cliente")
    public ResponseEntity<List<BookingResponse>> getBookingsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(bookingService.getBookingsByClientId(clientId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de una reserva")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancelar reserva (Admin)")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    // ── Callbacks MercadoPago ────────────────────────────────────────────────

    @GetMapping("/success")
    @Operation(summary = "Callback pago exitoso (MercadoPago)", description = "Confirma la reserva y redirige al frontend.")
    public void handleSuccess(
            @RequestParam("collection_id") String collectionId,
            @RequestParam("status") String mpStatus,
            @RequestParam("external_reference") String externalReference,
            HttpServletResponse response) throws IOException {
        bookingService.confirmBookingPayment(Long.parseLong(externalReference));
        response.sendRedirect(frontendUrl + "/payment/success");
    }

    @GetMapping("/pending")
    @Operation(summary = "Callback pago pendiente (MercadoPago)")
    public void handlePending(HttpServletResponse response) throws IOException {
        response.sendRedirect(frontendUrl + "/payment/pending");
    }

    @GetMapping("/failure")
    @Operation(summary = "Callback pago fallido (MercadoPago)")
    public void handleFailure(HttpServletResponse response) throws IOException {
        response.sendRedirect(frontendUrl + "/payment/failure");
    }
}
