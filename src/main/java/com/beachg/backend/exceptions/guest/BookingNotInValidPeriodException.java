package com.beachg.backend.exceptions.guest;

public class BookingNotInValidPeriodException extends RuntimeException {
    public BookingNotInValidPeriodException(String message) {
        super(message);
    }
}
