package com.beachg.backend.exceptions;

import com.beachg.backend.exceptions.amenity.AmenityNotFoundException;
import com.beachg.backend.exceptions.amenity.InvalidAmenityException;
import com.beachg.backend.exceptions.resort.ResortInvalidRegisterException;
import com.beachg.backend.exceptions.resort.ResortNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResortInvalidRegisterException.class)
    public ResponseEntity<String> handleResortInvalidRegisterException(ResortInvalidRegisterException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(ResortNotFoundException.class)
    public ResponseEntity<String> handleResortNotFoundException(ResortNotFoundException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(InvalidAmenityException.class)
    public ResponseEntity<String> handleInvalidAmenityException(InvalidAmenityException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(AmenityNotFoundException.class)
    public ResponseEntity<String> handleAmenityNotFoundException(AmenityNotFoundException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
