package com.andesstay.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Evento de auditoría / timeline de una reserva.
 * En la arquitectura final estos eventos se producen a Kafka (topic
 * "audit.timeline") y este servicio los consume; por ahora se persisten
 * directamente para poder tener el módulo de Auditoría funcionando end-to-end.
 */
@Entity
@Table(name = "audit_events")
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long reservationId;

    @Column(nullable = false)
    private String eventType; // RESERVA_CREADA, RESERVA_CONFIRMADA, CHECKIN, CHECKOUT, CANCELADA, etc.

    @Column(nullable = false)
    private String actor; // quién hizo la acción

    @Column
    private String details;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    protected AuditEvent() {
    }

    public AuditEvent(Long reservationId, String eventType, String actor, String details) {
        this.reservationId = reservationId;
        this.eventType = eventType;
        this.actor = actor;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public String getEventType() {
        return eventType;
    }

    public String getActor() {
        return actor;
    }

    public String getDetails() {
        return details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
