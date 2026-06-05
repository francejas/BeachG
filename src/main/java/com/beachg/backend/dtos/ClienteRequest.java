package com.beachg.backend.dtos;

public record ClienteRequest(
        String firstName,
        String lastName,
        String email,
        String password,
        String phone
) {
}
