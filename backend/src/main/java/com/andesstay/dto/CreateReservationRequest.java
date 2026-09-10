package com.andesstay.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class CreateReservationRequest {

    @NotNull(message = "unitId es obligatorio")
    private Long unitId;

    @NotBlank(message = "guestName es obligatorio")
    private String guestName;

    @NotBlank(message = "guestEmail es obligatorio")
    @Email(message = "guestEmail debe ser un email válido")
    private String guestEmail;

    @NotNull(message = "checkInDate es obligatorio")
    @FutureOrPresent(message = "checkInDate no puede ser en el pasado")
    private LocalDate checkInDate;

    @NotNull(message = "checkOutDate es obligatorio")
    private LocalDate checkOutDate;

    // Simulado mientras no hay auth real: quién crea la reserva
    @NotBlank(message = "createdBy es obligatorio (mientras no hay login)")
    private String createdBy;

    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }

    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
