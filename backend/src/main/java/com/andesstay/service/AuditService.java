package com.andesstay.service;

import com.andesstay.domain.AuditEvent;
import com.andesstay.repository.AuditEventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Registra eventos de auditoría.
 * NOTA: en la arquitectura objetivo, ms-andesstay-reservations publica estos
 * eventos a Kafka (topic "reservations.events") y ms-andesstay-audit los
 * consume y persiste. Hoy se persiste directo para tener el módulo completo.
 */
@Service
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    public AuditService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    public void record(Long reservationId, String eventType, String actor, String details) {
        auditEventRepository.save(new AuditEvent(reservationId, eventType, actor, details));
    }

    public List<AuditEvent> timelineFor(Long reservationId) {
        return auditEventRepository.findByReservationIdOrderByTimestampAsc(reservationId);
    }

    public List<AuditEvent> all() {
        return auditEventRepository.findAllByOrderByTimestampDesc();
    }

    public List<AuditEvent> byActor(String actor) {
        return auditEventRepository.findByActorOrderByTimestampDesc(actor);
    }
}
