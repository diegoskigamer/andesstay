package com.andesstay.controller;

import com.andesstay.domain.Reservation;
import com.andesstay.domain.ReservationStatus;
import com.andesstay.dto.CreateReservationRequest;
import com.andesstay.dto.UpdateStatusRequest;
import com.andesstay.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Corresponde a ms-andesstay-reservations -> /api/reservations/*
 * Seguridad: hoy sin JWT (andesstay.security.enabled=false).
 * Cuando se active: solo HUESPED puede crear las suyas, RECEPCIONISTA/ADMIN
 * pueden cambiar estado, todos los autenticados pueden listar según su rol.
 */
@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<Reservation> create(@Valid @RequestBody CreateReservationRequest request) {
        Reservation created = reservationService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public Reservation getById(@PathVariable Long id) {
        return reservationService.findById(id);
    }

    @PutMapping("/{id}/status")
    public Reservation updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest request) {
        return reservationService.updateStatus(id, request);
    }

    @GetMapping
    public List<Reservation> search(
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reservationService.search(status, from, to);
    }
}
