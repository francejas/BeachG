package com.beachg.backend.controllers;

import com.beachg.backend.dtos.resort.ResortRequest;
import com.beachg.backend.dtos.resort.ResortResponse;
import com.beachg.backend.services.ResortService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resorts")
@RequiredArgsConstructor
@Tag(name = "Balnearios", description = "CRUD de balnearios y gestión por parte del administrador")
public class ResortController {

    private final ResortService resortService;

    @GetMapping
    @Operation(summary = "Listar todos los balnearios", description = "Público. Devuelve todos los balnearios activos con sus unidades y amenidades.")
    public ResponseEntity<List<ResortResponse>> getResorts() {
        return ResponseEntity.ok(resortService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener balneario por ID", description = "Público.")
    public ResponseEntity<ResortResponse> getResortById(@PathVariable Long id) {
        return ResponseEntity.ok(resortService.getResortById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/my")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Obtener mi balneario (Admin)", description = "Devuelve el balneario asociado al email del JWT.")
    public ResponseEntity<ResortResponse> getMyResort(Authentication auth) {
        return ResponseEntity.ok(resortService.getMyResort(auth.getName()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/my")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Actualizar mi balneario (Admin)")
    public ResponseEntity<?> updateMyResort(Authentication auth, @RequestBody ResortRequest request) {
        ResortResponse saved = resortService.updateMyResort(auth.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Resort actualizado correctamente.", "resort", saved));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Registrar nuevo balneario (Admin)")
    public ResponseEntity<?> registerResort(@RequestBody ResortRequest request) {
        ResortResponse saved = resortService.registerResort(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Resort has been successfully registered!", "resort", saved));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Actualizar balneario por ID (Admin)")
    public ResponseEntity<?> updateResort(@PathVariable Long id, @RequestBody ResortRequest request) {
        ResortResponse saved = resortService.updateResort(id, request);
        return ResponseEntity.ok(Map.of("message", "Resort has been successfully updated!", "resort", saved));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/inactive")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Desactivar balneario (Admin)")
    public ResponseEntity<?> toInactiveResort(@PathVariable Long id) {
        ResortResponse saved = resortService.toInactive(id);
        return ResponseEntity.ok(Map.of("message", "Resort has been successfully deactivated!", "resort", saved));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/active")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Activar balneario (Admin)")
    public ResponseEntity<?> toActiveResort(@PathVariable Long id) {
        ResortResponse saved = resortService.toActive(id);
        return ResponseEntity.ok(Map.of("message", "Resort has been successfully activated!", "resort", saved));
    }
}
