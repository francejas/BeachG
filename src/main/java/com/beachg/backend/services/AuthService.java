package com.beachg.backend.services;

import com.beachg.backend.dtos.auth.AuthRequest;
import com.beachg.backend.dtos.auth.AuthResponse;
import com.beachg.backend.exceptions.auth.InvalidCredentialsException;
import com.beachg.backend.exceptions.client.ClientNotFoundException;
import com.beachg.backend.models.Client;
import com.beachg.backend.repositories.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(AuthRequest request) {
        Client client = clientRepository.findByEmail(request.email())
                .orElseThrow(() -> new ClientNotFoundException("Client not found"));

        if (!passwordEncoder.matches(request.password(), client.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        // TODO: llamar a JwtUtil para generar el token y retornarlo en AuthResponse
        // (Reemplazar el "token-pendiente" por el metodo de JwtUtil).
        return new AuthResponse("token-pendiente", client.getIdClient());
    }
}