package com.cdms.controller;

import com.cdms.dto.FinancialGoalDto;
import com.cdms.dto.GoalContributionDto;
import com.cdms.service.FinancialGoalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial-goals")
public class FinancialGoalController {

    private final FinancialGoalService financialGoalService;

    public FinancialGoalController(FinancialGoalService financialGoalService) {
        this.financialGoalService = financialGoalService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<FinancialGoalDto>> getAllGoals() {
        List<FinancialGoalDto> goals = financialGoalService.getAllGoals();
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<FinancialGoalDto>> getActiveGoals() {
        List<FinancialGoalDto> goals = financialGoalService.getActiveGoals();
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<?> getGoalSummary() {
        Object summary = financialGoalService.getGoalSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<FinancialGoalDto> getGoalById(@PathVariable Long id) {
        FinancialGoalDto goal = financialGoalService.getGoalById(id);
        return ResponseEntity.ok(goal);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<FinancialGoalDto> createGoal(@Valid @RequestBody FinancialGoalDto goalDto) {
        FinancialGoalDto goal = financialGoalService.createGoal(goalDto);
        return ResponseEntity.ok(goal);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<FinancialGoalDto> updateGoal(@PathVariable Long id, @Valid @RequestBody FinancialGoalDto goalDto) {
        FinancialGoalDto goal = financialGoalService.updateGoal(id, goalDto);
        return ResponseEntity.ok(goal);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        financialGoalService.deleteGoal(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/contributions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<GoalContributionDto> recordContribution(@Valid @RequestBody GoalContributionDto contributionDto) {
        GoalContributionDto contribution = financialGoalService.recordContribution(contributionDto);
        return ResponseEntity.ok(contribution);
    }

    @GetMapping("/{goalId}/contributions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<GoalContributionDto>> getGoalContributions(@PathVariable Long goalId) {
        List<GoalContributionDto> contributions = financialGoalService.getGoalContributions(goalId);
        return ResponseEntity.ok(contributions);
    }
}
