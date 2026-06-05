package com.beachg.backend.exceptions.amenity;

public class InvalidAmenityException extends RuntimeException {
    public InvalidAmenityException(String message) {
        super(message);
    }
}