package com.beachg.backend.exceptions.guest;

public class GuestAlreadyEnteredException extends RuntimeException {
    public GuestAlreadyEnteredException(String message) {
        super(message);
    }
}