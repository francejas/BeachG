package com.beachg.backend.exceptions;

public class AmenityNotFoundException extends RuntimeException {
    public AmenityNotFoundException(String message) {
        super(message);
public class AmenityNotFoundException extends RuntimeException{
    public AmenityNotFoundException(Long id) {
        super("Amenity con id " + id + " no encontrada");
    }
}
