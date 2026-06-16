package com.cdms.controller;

import com.cdms.dto.DecisionSupportDto;
import com.cdms.dto.FinancialHealthDto;
import com.cdms.service.DecisionSupportService;
import com.cdms.service.FinancialHealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/financial-health")
public class FinancialHealthController {

    private final FinancialHealthService financialHealthService;
    private final DecisionSupportService decisionSupportService;

    public FinancialHealthController(FinancialHealthService financialHealthService,
                                     DecisionSupportService decisionSupportService) {
        this.financialHealthService = financialHealthService;
        this.decisionSupportService = decisionSupportService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<FinancialHealthDto> calculateFinancialHealth() {
        FinancialHealthDto health = financialHealthService.calculateFinancialHealth();
        return ResponseEntity.ok(health);
    }

    @GetMapping("/decision-support")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<DecisionSupportDto> generateDecisionSupport() {
        DecisionSupportDto support = decisionSupportService.generateDecisionSupport();
        return ResponseEntity.ok(support);
    }
}
