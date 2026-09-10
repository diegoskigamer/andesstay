package com.andesstay.exception;

/** Excepción para violaciones de reglas de negocio (ej: transición de estado inválida). */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
