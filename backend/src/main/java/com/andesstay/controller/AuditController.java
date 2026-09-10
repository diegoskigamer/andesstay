package com.andesstay.controller;

import com.andesstay.domain.AuditEvent;
import com.andesstay.service.AuditService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Corresponde a ms-andesstay-audit -> /api/audit/* (solo lectura). */
@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public List<AuditEvent> all(@RequestParam(required = false) String actor) {
        if (actor != null && !actor.isBlank()) {
            return auditService.byActor(actor);
        }
        return auditService.all();
    }

    @GetMapping("/reservations/{reservationId}")
    public List<AuditEvent> timeline(@PathVariable Long reservationId) {
        return auditService.timelineFor(reservationId);
    }
}
