package com.beachg.backend.dtos.booking;

public record GuestRequest(
        String fullName,
        String dni
) {
}
