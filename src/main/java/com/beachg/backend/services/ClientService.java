package com.beachg.backend.services;

import com.beachg.backend.dtos.booking.BookingSummaryResponse;
import com.beachg.backend.dtos.client.ClientRequest;
import com.beachg.backend.dtos.client.ClientResponse;
import com.beachg.backend.exceptions.client.ClientInvalidRegisterException;
import com.beachg.backend.exceptions.client.ClientNotFoundException;
import com.beachg.backend.models.Client;
import com.beachg.backend.repositories.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    public List<ClientResponse> getAll() {
        return clientRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ClientResponse getClientById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException("Client with id " + id + " not found"));

        return mapToResponse(client);
    }

    public ClientResponse registerClient(ClientRequest request) {
        if (clientRepository.findByEmail(request.email()).isPresent()) {
            throw new ClientInvalidRegisterException("Client already exists");
        }

        Client client = new Client();
        client.setFirstName(request.firstName());
        client.setLastName(request.lastName());
        client.setEmail(request.email());
        client.setPasswordHash(passwordEncoder.encode(request.password()));
        client.setPhone(request.phone());

        // TODO: Fijarse lista de reservas (bookings) como setearla. Default: null
        //client.setBookings(null);

        return mapToResponse(clientRepository.save(client));
    }

    public ClientResponse updateClient(Long id, ClientRequest request) {
        Client saved = clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException("Client with id " + id + " not found"));

        saved.setFirstName(request.firstName());
        saved.setLastName(request.lastName());
        saved.setEmail(request.email());
        saved.setPasswordHash(passwordEncoder.encode(request.password()));
        saved.setPhone(request.phone());

        return mapToResponse(clientRepository.save(saved));
    }

    private ClientResponse mapToResponse(Client client) {

        List<BookingSummaryResponse> bookingSummaries = (client.getBookings() == null) ? List.of() :
                client.getBookings().stream()
                .map(b -> new BookingSummaryResponse(
                        b.getId(),
                        b.getStartDate(),
                        b.getEndDate(),
                        b.getTotalPrice(),
                        b.getStatus().name(),
                        b.getRentalUnit().getIdentifier()
                ))
                .toList();

        return new ClientResponse(
                client.getIdClient(),
                client.getFirstName(),
                client.getLastName(),
                client.getEmail(),
                client.getPhone(),
                bookingSummaries
        );
    }
}
