package com.andesstay.dto;

import java.math.BigDecimal;

/** Update parcial: solo tarifa y/o disponibilidad total (según el caso: "tarifa/disponibilidad"). */
public class UnitUpdateRequest {

    private BigDecimal nightlyRate;
    private Integer totalCount;
    private Integer availableCount;

    public BigDecimal getNightlyRate() { return nightlyRate; }
    public void setNightlyRate(BigDecimal nightlyRate) { this.nightlyRate = nightlyRate; }

    public Integer getTotalCount() { return totalCount; }
    public void setTotalCount(Integer totalCount) { this.totalCount = totalCount; }

    public Integer getAvailableCount() { return availableCount; }
    public void setAvailableCount(Integer availableCount) { this.availableCount = availableCount; }
}
