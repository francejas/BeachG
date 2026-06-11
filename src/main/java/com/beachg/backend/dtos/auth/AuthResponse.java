package com.beachg.backend.dtos.auth;

public record AuthResponse(
        String token,
        int clientId
) {
}
