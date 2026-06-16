package com.cdms.dto;

import java.math.BigDecimal;
import java.util.List;

public class FinancialHealthDto {
    private Integer score;
    private String status;
    private BigDecimal incomeGrowthRate;
    private BigDecimal expenseControlRate;
    private BigDecimal cashFlowStability;
    private BigDecimal budgetEfficiency;
    private List<String> recommendations;

    public FinancialHealthDto() {}

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getIncomeGrowthRate() { return incomeGrowthRate; }
    public void setIncomeGrowthRate(BigDecimal incomeGrowthRate) { this.incomeGrowthRate = incomeGrowthRate; }
    public BigDecimal getExpenseControlRate() { return expenseControlRate; }
    public void setExpenseControlRate(BigDecimal expenseControlRate) { this.expenseControlRate = expenseControlRate; }
    public BigDecimal getCashFlowStability() { return cashFlowStability; }
    public void setCashFlowStability(BigDecimal cashFlowStability) { this.cashFlowStability = cashFlowStability; }
    public BigDecimal getBudgetEfficiency() { return budgetEfficiency; }
    public void setBudgetEfficiency(BigDecimal budgetEfficiency) { this.budgetEfficiency = budgetEfficiency; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
}
