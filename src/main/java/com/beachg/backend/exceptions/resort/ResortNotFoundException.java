package com.beachg.backend.exceptions.resort;

public class ResortNotFoundException extends RuntimeException {
    public ResortNotFoundException(String message) {
        super(message);
    }
}
