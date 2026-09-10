package com.andesstay.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Unidad de alojamiento (habitación, cabaña o lodge) del catálogo.
 * La disponibilidad (availableCount) disminuye cuando una reserva se CONFIRMA
 * y se libera cuando la reserva termina su estadía (CHECKOUT) o se CANCELA
 * antes de confirmar (o después, según la política).
 */
@Entity
@Table(name = "units")
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitType type;

    @Column(nullable = false)
    private String hostelName; // a qué hostal/cabaña/lodge de la red pertenece

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer totalCount; // total de unidades de este tipo disponibles en el hostal

    @Column(nullable = false)
    private Integer availableCount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal nightlyRate;

    protected Unit() {
    }

    public Unit(String name, UnitType type, String hostelName, Integer capacity,
                Integer totalCount, BigDecimal nightlyRate) {
        this.name = name;
        this.type = type;
        this.hostelName = hostelName;
        this.capacity = capacity;
        this.totalCount = totalCount;
        this.availableCount = totalCount;
        this.nightlyRate = nightlyRate;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UnitType getType() {
        return type;
    }

    public void setType(UnitType type) {
        this.type = type;
    }

    public String getHostelName() {
        return hostelName;
    }

    public void setHostelName(String hostelName) {
        this.hostelName = hostelName;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }

    public Integer getAvailableCount() {
        return availableCount;
    }

    public void setAvailableCount(Integer availableCount) {
        this.availableCount = availableCount;
    }

    public BigDecimal getNightlyRate() {
        return nightlyRate;
    }

    public void setNightlyRate(BigDecimal nightlyRate) {
        this.nightlyRate = nightlyRate;
    }

    public void decreaseAvailability() {
        if (availableCount <= 0) {
            throw new IllegalStateException("No hay disponibilidad para la unidad " + name);
        }
        availableCount--;
    }

    public void increaseAvailability() {
        if (availableCount < totalCount) {
            availableCount++;
        }
    }
}
