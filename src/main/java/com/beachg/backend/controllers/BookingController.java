package com.beachg.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/apu/bookings")
@CrossOrigin("*")
@RequiredArgsConstructor
public class BookingController {
}
