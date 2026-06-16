package com.cdms.controller;

import com.cdms.dto.DashboardDto;
import com.cdms.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<DashboardDto> getDashboard() {
        DashboardDto dashboard = dashboardService.getDashboardData();
        return ResponseEntity.ok(dashboard);
    }
}
