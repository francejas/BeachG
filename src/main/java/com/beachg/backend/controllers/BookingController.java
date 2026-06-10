package com.beachg.backend.controllers;

import com.beachg.backend.dtos.booking.BookingRequest;
import com.beachg.backend.dtos.booking.BookingResponse;
import com.beachg.backend.services.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin("*")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // 1. Crear una nueva reserva (POST)
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
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

    // 4. Ver el detalle de una reserva específica por su ID (GET /api/bookings/{id})
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    
}
