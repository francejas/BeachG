package com.beachg.backend.exceptions.guest;

public class GuestNotFoundException extends RuntimeException {
    public GuestNotFoundException(String message) {
        super(message);
    }
}
