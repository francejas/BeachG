package com.beachg.backend.exceptions.booking;

public class UnitNotAvailableException extends RuntimeException {
    public UnitNotAvailableException(String message) {
        super(message);
    }
}
