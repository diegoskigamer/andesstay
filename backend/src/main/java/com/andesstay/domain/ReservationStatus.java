package com.andesstay.domain;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Estados del ciclo de vida de una reserva, según el caso AndesStay:
 * CREADA -> CONFIRMADA -> CHECKIN_PENDIENTE -> EN_ESTADIA -> CHECKOUT
 * CREADA / CONFIRMADA -> CANCELADA
 *
 * Regla clave: no se puede hacer check-in sin haber CONFIRMADO antes.
 */
public enum ReservationStatus {
    CREADA,
    CONFIRMADA,
    CHECKIN_PENDIENTE,
    EN_ESTADIA,
    CHECKOUT,
    CANCELADA;

    private static final Map<ReservationStatus, Set<ReservationStatus>> ALLOWED_TRANSITIONS = Map.of(
            CREADA, EnumSet.of(CONFIRMADA, CANCELADA),
            CONFIRMADA, EnumSet.of(CHECKIN_PENDIENTE, CANCELADA),
            CHECKIN_PENDIENTE, EnumSet.of(EN_ESTADIA, CANCELADA),
            EN_ESTADIA, EnumSet.of(CHECKOUT),
            CHECKOUT, EnumSet.noneOf(ReservationStatus.class),
            CANCELADA, EnumSet.noneOf(ReservationStatus.class)
    );

    public boolean canTransitionTo(ReservationStatus target) {
        return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }
}
