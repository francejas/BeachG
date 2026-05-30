package com.beachg.backend.controllers;

import com.beachg.backend.models.Resort;
import com.beachg.backend.service.ResortService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resort")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ResortController {

    private final ResortService resortService;

    @GetMapping
    public ResponseEntity<List<Resort>> getResorts() {
        return ResponseEntity.ok(resortService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resort> getResortById(@PathVariable Long id) {
        return ResponseEntity.ok(resortService.getResortById(id));
    }

    @PostMapping
    public ResponseEntity<?> registerResort(@RequestBody Resort resort) {
        Resort saved = resortService.registerResort(resort);

        return ResponseEntity.ok(Map.of(
                "message", "Resort has been successfully registered!",
                "resort", saved
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateResort(@PathVariable Long id, @RequestBody Resort resort) {
        Resort saved = resortService.updateResort(id, resort);

        return ResponseEntity.ok(Map.of(
                "message", "Resort has been successfully updated!",
                "resort", saved
        ));
    }

    @PutMapping("/{id}/inactive")
    public ResponseEntity<?> toInactiveResort(@PathVariable Long id) {
        Resort saved = resortService.toInactive(id);

        return ResponseEntity.ok(Map.of(
                "message", "Resort has been successfully deactivated!",
                "resort", saved
        ));
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<?> toActiveResort(@PathVariable Long id) {
        Resort saved = resortService.toActive(id);

        return ResponseEntity.ok(Map.of(
                "message", "Resort has been successfully activated!",
                "resort", saved
        ));
    }


}
