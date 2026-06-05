package com.beachg.backend.dtos;

import java.util.List;

public record ClienteResponse(
        Long idClient,
        String firstName,
        String lastName,
        String email,
        String password,
        String phone
) {
}
