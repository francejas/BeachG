package com.beachg.backend.dtos.auth;

public record AuthRequest(
        String email,
        String password
) {
}
