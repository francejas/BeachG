package com.beachg.backend.controllers;

import com.beachg.backend.dtos.client.ClientRequest;
import com.beachg.backend.dtos.client.ClientResponse;
import com.beachg.backend.services.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@Tag(name = "Clientes", description = "Registro y gestión de clientes")
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    @Operation(summary = "Registrar cliente", description = "Público. Crea una nueva cuenta de cliente.")
    public ResponseEntity<ClientResponse> registerClient(@RequestBody ClientRequest request) {
        return new ResponseEntity<>(clientService.registerClient(request), HttpStatus.CREATED);
    }

    @GetMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Listar todos los clientes")
    public ResponseEntity<List<ClientResponse>> getAllClients() {
        return ResponseEntity.ok(clientService.getAll());
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Obtener cliente por ID")
    public ResponseEntity<ClientResponse> getClientById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Actualizar datos del cliente")
    public ResponseEntity<ClientResponse> updateClient(@PathVariable Long id, @RequestBody ClientRequest request) {
        return ResponseEntity.ok(clientService.updateClient(id, request));
    }
}
