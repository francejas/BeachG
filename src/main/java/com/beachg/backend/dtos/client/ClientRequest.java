package com.beachg.backend.dtos.client;

public record ClientRequest(
        String firstName,
        String lastName,
        String email,
        String password,
        String phone,
        String dni
) {
}
