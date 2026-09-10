package com.andesstay.service;

import com.andesstay.domain.Reservation;
import com.andesstay.domain.ReservationStatus;
import com.andesstay.domain.Unit;
import com.andesstay.repository.ReservationRepository;
import com.andesstay.repository.UnitRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * KPIs de operación. En la arquitectura final estos datos vienen de
 * streaming Kafka (topic reservations.events) consumido por
 * ms-andesstay-report, sin bloquear el core. Por ahora se calculan
 * directamente sobre la base para tener el panel funcionando.
 */
@Service
public class ReportService {

    private final ReservationRepository reservationRepository;
    private final UnitRepository unitRepository;

    public ReportService(ReservationRepository reservationRepository, UnitRepository unitRepository) {
        this.reservationRepository = reservationRepository;
        this.unitRepository = unitRepository;
    }

    public Map<String, Object> kpis(String range) {
        int hours = parseRangeToHours(range);
        LocalDateTime since = LocalDateTime.now().minusHours(hours);

        List<Reservation> recent = reservationRepository.findByCreatedAtAfter(since);

        // Reservas por hora (bucket)
        Map<String, Long> reservationsByHour = recent.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:00")),
                        TreeMap::new,
                        Collectors.counting()
                ));

        // Tiempo de ciclo promedio (CREADA -> CHECKOUT), en horas, sobre reservas que llegaron a CHECKOUT
        List<Reservation> completed = recent.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CHECKOUT)
                .toList();

        double avgCycleHours = completed.stream()
                .mapToDouble(r -> Duration.between(r.getCreatedAt(), r.getUpdatedAt()).toMinutes() / 60.0)
                .average()
                .orElse(0.0);

        // Ocupación activa: unidades con availableCount < totalCount
        List<Unit> units = unitRepository.findAll();
        long occupiedUnits = units.stream().filter(u -> u.getAvailableCount() < u.getTotalCount()).count();
        int totalUnits = units.size();
        double occupancyRate = totalUnits == 0 ? 0.0 : (occupiedUnits * 100.0 / totalUnits);

        long activeStays = recent.stream()
                .filter(r -> r.getStatus() == ReservationStatus.EN_ESTADIA)
                .count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("range", range);
        result.put("totalReservations", recent.size());
        result.put("reservationsByHour", reservationsByHour);
        result.put("avgCycleTimeHours", Math.round(avgCycleHours * 100.0) / 100.0);
        result.put("occupancyRatePercent", Math.round(occupancyRate * 100.0) / 100.0);
        result.put("occupiedUnits", occupiedUnits);
        result.put("totalUnits", totalUnits);
        result.put("activeStays", activeStays);
        return result;
    }

    public List<Map<String, Object>> topUnits(String range) {
        int hours = parseRangeToHours(range);
        LocalDateTime since = LocalDateTime.now().minusHours(hours);

        List<Reservation> recent = reservationRepository.findByCreatedAtAfter(since);

        Map<Unit, Long> byUnit = recent.stream()
                .collect(Collectors.groupingBy(Reservation::getUnit, Collectors.counting()));

        return byUnit.entrySet().stream()
                .sorted(Map.Entry.<Unit, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("unitId", e.getKey().getId());
                    m.put("unitName", e.getKey().getName());
                    m.put("hostelName", e.getKey().getHostelName());
                    m.put("reservationsCount", e.getValue());
                    return m;
                })
                .toList();
    }

    private int parseRangeToHours(String range) {
        if (range == null || range.isBlank()) return 24;
        return switch (range) {
            case "last24h" -> 24;
            case "last7d" -> 24 * 7;
            case "last30d" -> 24 * 30;
            default -> 24;
        };
    }
}
