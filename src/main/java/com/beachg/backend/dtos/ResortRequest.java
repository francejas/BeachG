package com.beachg.backend.dtos;

import java.util.List;

public record ResortRequest(
        String name,
        String location,
        String adminEmail,
        String password,
        String coverPhotoUrl,
        List<Long> aminityIds
) {
}
