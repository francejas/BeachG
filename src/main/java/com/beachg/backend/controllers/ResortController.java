package com.beachg.backend.controllers;

import com.beachg.backend.dtos.ResortRequest;
import com.beachg.backend.dtos.ResortResponse;
import com.beachg.backend.services.ResortService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resorts")
@CrossOrigin("*")
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

    @PostMapping
    public ResponseEntity<?> registerResort(@RequestBody ResortRequest request) {
        ResortResponse saved = resortService.registerResort(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Resort has been successfully registered!",
                "resort", saved
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateResort(@PathVariable Long id, @RequestBody ResortRequest request) {
        ResortResponse saved = resortService.updateResort(id, request);

        return ResponseEntity.ok(Map.of(
                "message", "Resort has been successfully updated!",
                "resort", saved
        ));
    }

    @PutMapping("/{id}/inactive")
    public ResponseEntity<?> toInactiveResort(@PathVariable Long id) {
        ResortResponse saved = resortService.toInactive(id);

        return ResponseEntity.ok(Map.of(
                "message", "Resort has been successfully deactivated!",
                "resort", saved
        ));
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<?> toActiveResort(@PathVariable Long id) {
        ResortResponse saved = resortService.toActive(id);

        return ResponseEntity.ok(Map.of(
                "message", "Resort has been successfully activated!",
                "resort", saved
        ));
    }
}
