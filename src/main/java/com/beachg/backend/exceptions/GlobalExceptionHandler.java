package com.beachg.backend.exceptions;

import com.beachg.backend.exceptions.amenity.AmenityNotFoundException;
import com.beachg.backend.exceptions.amenity.InvalidAmenityException;
import com.beachg.backend.exceptions.auth.InvalidCredentialsException;
import com.beachg.backend.exceptions.booking.BookingForbiddenException;
import com.beachg.backend.exceptions.booking.UnitNotAvailableException;
import com.beachg.backend.exceptions.client.ClientInvalidRegisterException;
import com.beachg.backend.exceptions.client.ClientNotFoundException;
import com.beachg.backend.exceptions.guest.BookingNotPaidException;
import com.beachg.backend.exceptions.guest.GuestAlreadyEnteredException;
import com.beachg.backend.exceptions.guest.GuestNotFoundException;
import com.beachg.backend.exceptions.resort.ResortInvalidRegisterException;
import com.beachg.backend.exceptions.resort.ResortNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({
            ClientNotFoundException.class,
            GuestNotFoundException.class,
            ResortNotFoundException.class,
            AmenityNotFoundException.class
    })
    public ResponseEntity<Map<String, String>> handleNotFound(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler({
            UnitNotAvailableException.class,
            InvalidAmenityException.class,
            BookingNotPaidException.class,
            GuestAlreadyEnteredException.class,
            ClientInvalidRegisterException.class,
            ResortInvalidRegisterException.class
    })
    public ResponseEntity<Map<String, String>> handleBadRequest(RuntimeException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(BookingForbiddenException.class)
    public ResponseEntity<Map<String, String>> handleForbidden(BookingForbiddenException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorized(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error interno del servidor"));
    }
}
