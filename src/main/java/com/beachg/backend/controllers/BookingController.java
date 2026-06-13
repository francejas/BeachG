package com.beachg.backend.controllers;

import com.beachg.backend.dtos.booking.BookingRequest;
import com.beachg.backend.dtos.booking.BookingResponse;
import com.beachg.backend.services.BookingService;
import com.beachg.backend.services.MercadoPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin("*")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final MercadoPagoService mercadoPagoService; //  Inyectamos nuevo servicio

    @Value("${NGROK_BASE_URL}")
    private String baseUrl;

    // 1. Crear una nueva reserva y generar link de pago (O confirmar directo si es presencial)
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        // A. Creamos la reserva en tu BD
        BookingResponse booking = bookingService.createBooking(request);

        // =======================================================
        // INTERCEPCIÓN PARA RESERVAS PRESENCIALES (WALK-IN)
        // =======================================================
        if (request.isWalkIn() != null && request.isWalkIn()) {
            // Si es en el mostrador, devolvemos el OK directo, sin link de pago.
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Reserva presencial confirmada correctamente. Código/s QR generados.",
                    "booking", booking
            ));
        }

        // =======================================================
        // LÓGICA WEB NORMAL (MERCADO PAGO)
        // =======================================================

        // C. Generamos el link de pago pasándole las URLs y el ID de la reserva
        String paymentUrl = mercadoPagoService.createPaymentPreference(
                "Reserva BeachG",
                booking.totalPrice(),
                1,
                baseUrl + "/api/bookings/success",
                baseUrl + "/api/bookings/pending",
                baseUrl + "/api/bookings/failure",
                booking.id() // <--- ACÁ LE PASAMOS EL ID AL SERVICIO
        );

        // D. Devolvemos un objeto que contiene tanto los datos de la reserva como el link de Mercado Pago
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "booking", booking,
                "paymentUrl", paymentUrl
        ));
    }

    // 2. Ver todas las reservas (Para el Panel del Administrador)
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // 3. Ver las reservas de un cliente específico (Para el Portal del Cliente)
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(bookingService.getBookingsByClientId(clientId));
    }

    // 4. Ver el detalle de una reserva específica por su ID
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // ==========================================
    // ENDPOINTS DE RETORNO DE MERCADO PAGO
    // ==========================================

    @GetMapping("/success")
    public String handleSuccess(
            @RequestParam("collection_id") String collectionId,
            @RequestParam("status") String mpStatus,
            @RequestParam("external_reference") String externalReference) { // <--- ATRAPAMOS EL POST-IT

        // 1. Convertimos el ID que mandó Mercado Pago a un Long
        Long bookingId = Long.parseLong(externalReference);

        // 2. Le avisamos a tu BD que la reserva está pagada
        bookingService.confirmBookingPayment(bookingId);

        // 3. Devolvemos el mensaje triunfal
        return "¡Genial! El pago se acreditó correctamente. La reserva #" + bookingId + " ya está confirmada. ID Mercado Pago: " + collectionId;
    }

    @GetMapping("/pending")
    public String handlePending() {
        // Mercado Pago redirige acá si pagaron en efectivo (Ej: PagoFácil)
        return "El pago está pendiente. Te avisaremos cuando se acredite el dinero.";
    }

    @GetMapping("/failure")
    public String handleFailure() {
        // Mercado Pago redirige acá si la tarjeta sin fondos
        return "El pago fue rechazado. Por favor, intentá nuevamente con otro método de pago.";
    }
}