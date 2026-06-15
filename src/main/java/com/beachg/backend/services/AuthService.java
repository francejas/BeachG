package com.beachg.backend.services;

import com.beachg.backend.dtos.auth.AuthRequest;
import com.beachg.backend.dtos.auth.AuthResponse;
import com.beachg.backend.exceptions.auth.InvalidCredentialsException;
import com.beachg.backend.exceptions.client.ClientNotFoundException;
import com.beachg.backend.models.Client;
import com.beachg.backend.repositories.ClientRepository;
import com.beachg.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(AuthRequest request) {
        Client client = clientRepository.findByEmail(request.email())
                .orElseThrow(() -> new ClientNotFoundException("Client not found"));

        if (!passwordEncoder.matches(request.password(), client.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        UserDetails userDetails = User.withUsername(client.getEmail())
                .password(client.getPasswordHash())
                .roles(client.getRole())
                .build();

        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, client.getIdClient());
    }
}