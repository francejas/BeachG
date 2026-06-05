package com.beachg.backend.dtos;

public record ClienteResponse(
        Long idClient,
        String firstName,
        String lastName,
        String email,
        String password,
        String phone
) {
}
