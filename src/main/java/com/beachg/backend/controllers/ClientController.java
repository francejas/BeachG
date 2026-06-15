package com.beachg.backend.controllers;

import com.beachg.backend.dtos.client.ClientRequest;
import com.beachg.backend.dtos.client.ClientResponse;
import com.beachg.backend.services.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {
    private final ClientService clientService;

    //endpointt para registrar al cleinte
    @PostMapping
    public ResponseEntity<ClientResponse> registerClient(@RequestBody ClientRequest request){
        return new ResponseEntity<>(clientService.registerClient(request), HttpStatus.CREATED);
    }

    //endpoint para listar todos los clientes
    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAllClients(){
        return ResponseEntity.ok(clientService.getAll());
    }

    //endpoint para traer un cliente por id
    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> getClientById(@PathVariable Long id){
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    //endpoint para actualizar datos del cliente
    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> updateClient(@PathVariable Long id, @RequestBody ClientRequest request){
        return ResponseEntity.ok(clientService.updateClient(id, request));
    }






}
