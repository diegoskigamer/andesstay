package com.andesstay.dto;

import com.andesstay.domain.UnitType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class UnitRequest {

    @NotBlank(message = "name es obligatorio")
    private String name;

    @NotNull(message = "type es obligatorio")
    private UnitType type;

    @NotBlank(message = "hostelName es obligatorio")
    private String hostelName;

    @NotNull @Min(1)
    private Integer capacity;

    @NotNull @Min(0)
    private Integer totalCount;

    @NotNull @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal nightlyRate;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public UnitType getType() { return type; }
    public void setType(UnitType type) { this.type = type; }

    public String getHostelName() { return hostelName; }
    public void setHostelName(String hostelName) { this.hostelName = hostelName; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Integer getTotalCount() { return totalCount; }
    public void setTotalCount(Integer totalCount) { this.totalCount = totalCount; }

    public BigDecimal getNightlyRate() { return nightlyRate; }
    public void setNightlyRate(BigDecimal nightlyRate) { this.nightlyRate = nightlyRate; }
}
