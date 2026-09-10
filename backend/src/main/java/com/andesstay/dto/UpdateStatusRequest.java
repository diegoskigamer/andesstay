package com.andesstay.dto;

import com.andesstay.domain.ReservationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public class UpdateStatusRequest {

    @NotNull(message = "status es obligatorio")
    private ReservationStatus status;

    @NotBlank(message = "actor es obligatorio (mientras no hay login)")
    private String actor;

    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }
}
