package com.andesstay.service;

import com.andesstay.domain.Reservation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Punto de integración para notificaciones (email/push al huésped y ticket
 * de housekeeping).
 *
 * En la arquitectura final esto publica a RabbitMQ:
 *   - exchange "cmd.direct" / routing key "email.send"        -> q.cmd.email
 *   - exchange "cmd.topic"  / routing key "housekeeping.ticket"-> q.cmd.housekeeping
 *   - exchange "cmd.direct" / routing key "voucher.gen"        -> q.cmd.voucher
 *
 * Por ahora solo loggea, para no acoplar el módulo core a RabbitMQ todavía.
 * Cuando conectemos RabbitMQ, esta clase pasa a inyectar un RabbitTemplate
 * y arma el envelope común (type, eventId, timestamp, traceId, correlationId).
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    public void notifyGuestReservationCreated(Reservation reservation) {
        log.info("[NOTIFY:email.send] Reserva {} creada para {} ({})",
                reservation.getId(), reservation.getGuestName(), reservation.getGuestEmail());
    }

    public void notifyGuestConfirmation(Reservation reservation) {
        log.info("[NOTIFY:email.send] Reserva {} CONFIRMADA. Voucher pendiente.", reservation.getId());
    }

    public void notifyHousekeepingCheckin(Reservation reservation) {
        log.info("[NOTIFY:housekeeping.ticket] Preparar unidad {} para check-in de reserva {}",
                reservation.getUnit().getName(), reservation.getId());
    }

    public void notifyGuestCheckout(Reservation reservation) {
        log.info("[NOTIFY:email.send] Reserva {} en CHECKOUT. Gracias por su estadía.", reservation.getId());
    }

    public void notifyGuestCancellation(Reservation reservation) {
        log.info("[NOTIFY:email.send] Reserva {} CANCELADA.", reservation.getId());
    }
}
