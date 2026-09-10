package com.andesstay.repository;

import com.andesstay.domain.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

    List<AuditEvent> findByReservationIdOrderByTimestampAsc(Long reservationId);

    List<AuditEvent> findAllByOrderByTimestampDesc();

    List<AuditEvent> findByActorOrderByTimestampDesc(String actor);
}
