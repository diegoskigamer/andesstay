package com.andesstay.service;

import com.andesstay.domain.Reservation;
import com.andesstay.domain.ReservationStatus;
import com.andesstay.domain.Unit;
import com.andesstay.dto.CreateReservationRequest;
import com.andesstay.dto.UpdateStatusRequest;
import com.andesstay.exception.BusinessException;
import com.andesstay.exception.NotFoundException;
import com.andesstay.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final CatalogService catalogService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public ReservationService(ReservationRepository reservationRepository,
                               CatalogService catalogService,
                               AuditService auditService,
                               NotificationService notificationService) {
        this.reservationRepository = reservationRepository;
        this.catalogService = catalogService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    public List<Reservation> search(ReservationStatus status, LocalDate from, LocalDate to) {
        return reservationRepository.search(status, from, to);
    }

    public Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Reserva no encontrada: " + id));
    }

    @Transactional
    public Reservation create(CreateReservationRequest request) {
        Unit unit = catalogService.findById(request.getUnitId());

        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new BusinessException("checkOutDate debe ser posterior a checkInDate");
        }

        Reservation reservation = new Reservation(
                unit,
                request.getGuestName(),
                request.getGuestEmail(),
                request.getCheckInDate(),
                request.getCheckOutDate(),
                request.getCreatedBy()
        );
        reservation = reservationRepository.save(reservation);

        auditService.record(reservation.getId(), "RESERVA_CREADA", request.getCreatedBy(),
                "Reserva creada para unidad " + unit.getName());
        notificationService.notifyGuestReservationCreated(reservation);

        return reservation;
    }

    /**
     * Cambia el estado de una reserva aplicando las reglas del caso:
     * - No se puede hacer check-in (CHECKIN_PENDIENTE / EN_ESTADIA) sin haber CONFIRMADO antes.
     * - La disponibilidad de la unidad disminuye al CONFIRMAR.
     * - Al CHECKOUT o cancelar una reserva CONFIRMADA, se libera la disponibilidad.
     * - Solo se permiten las transiciones definidas en ReservationStatus.
     */
    @Transactional
    public Reservation updateStatus(Long id, UpdateStatusRequest request) {
        Reservation reservation = findById(id);
        ReservationStatus current = reservation.getStatus();
        ReservationStatus target = request.getStatus();

        if (current == target) {
            throw new BusinessException("La reserva ya está en estado " + target);
        }

        if (!current.canTransitionTo(target)) {
            throw new BusinessException(
                    "Transición inválida: " + current + " -> " + target +
                    ". No se puede hacer check-in sin CONFIRMAR, ni saltar estados.");
        }

        Unit unit = reservation.getUnit();

        switch (target) {
            case CONFIRMADA -> {
                unit.decreaseAvailability();
                notificationService.notifyGuestConfirmation(reservation);
            }
            case CHECKIN_PENDIENTE -> notificationService.notifyHousekeepingCheckin(reservation);
            case EN_ESTADIA -> { /* huésped ya hizo check-in físico */ }
            case CHECKOUT -> {
                unit.increaseAvailability();
                notificationService.notifyGuestCheckout(reservation);
            }
            case CANCELADA -> {
                if (current == ReservationStatus.CONFIRMADA) {
                    unit.increaseAvailability();
                }
                notificationService.notifyGuestCancellation(reservation);
            }
            default -> { /* CREADA no se alcanza como target vía transición */ }
        }

        reservation.setStatus(target);
        reservationRepository.save(reservation);

        auditService.record(reservation.getId(), "ESTADO_" + target, request.getActor(),
                "Cambio de estado: " + current + " -> " + target);

        return reservation;
    }
}
