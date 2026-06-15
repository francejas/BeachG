package com.beachg.backend.controllers;

import com.beachg.backend.dtos.resort.ResortRequest;
import com.beachg.backend.dtos.resort.ResortResponse;
import com.beachg.backend.services.ResortService;
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
public class ResortController {

    private final ResortService resortService;

    @GetMapping
    public ResponseEntity<List<ResortResponse>> getResorts() {
        return ResponseEntity.ok(resortService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResortResponse> getResortById(@PathVariable Long id) {
        return ResponseEntity.ok(resortService.getResortById(id));
    }

    // El admin obtiene los datos de SU resort usando el email del JWT
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/my")
    public ResponseEntity<ResortResponse> getMyResort(Authentication auth) {
        return ResponseEntity.ok(resortService.getMyResort(auth.getName()));
    }

    // El admin actualiza SU resort — no necesita saber el ID
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/my")
    public ResponseEntity<?> updateMyResort(Authentication auth, @RequestBody ResortRequest request) {
        ResortResponse saved = resortService.updateMyResort(auth.getName(), request);
        return ResponseEntity.ok(Map.of(
                "message", "Resort actualizado correctamente.",
                "resort", saved
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> registerResort(@RequestBody ResortRequest request) {
        ResortResponse saved = resortService.registerResort(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Resort has been successfully registered!",
                "resort", saved
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateResort(@PathVariable Long id, @RequestBody ResortRequest request) {
        ResortResponse saved = resortService.updateResort(id, request);

        return ResponseEntity.ok(Map.of(
                "message", "Resort has been successfully updated!",
                "resort", saved
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/inactive")
    public ResponseEntity<?> toInactiveResort(@PathVariable Long id) {
        ResortResponse saved = resortService.toInactive(id);

        return ResponseEntity.ok(Map.of(
                "message", "Resort has been successfully deactivated!",
                "resort", saved
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/active")
    public ResponseEntity<?> toActiveResort(@PathVariable Long id) {
        ResortResponse saved = resortService.toActive(id);

        return ResponseEntity.ok(Map.of(
                "message", "Resort has been successfully activated!",
                "resort", saved
        ));
    }
}
