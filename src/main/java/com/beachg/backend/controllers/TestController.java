package com.beachg.backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/ping")
    public String hacerPing() {
        return "Funciona";
    }
}