package com.andesstay.controller;

import com.andesstay.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Corresponde a ms-andesstay-report -> /api/report/* (solo lectura, solo Admin). */
@RestController
@RequestMapping("/api/report")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/kpis")
    public Map<String, Object> kpis(@RequestParam(defaultValue = "last24h") String range) {
        return reportService.kpis(range);
    }

    @GetMapping("/top-units")
    public List<Map<String, Object>> topUnits(@RequestParam(defaultValue = "last7d") String range) {
        return reportService.topUnits(range);
    }
}
