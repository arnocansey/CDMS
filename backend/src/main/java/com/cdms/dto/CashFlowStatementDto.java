package com.cdms.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public class CashFlowStatementDto {
    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal openingBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal closingBalance;
    private Map<String, BigDecimal> incomeBreakdown;
    private Map<String, BigDecimal> expenseBreakdown;

    public CashFlowStatementDto() {}

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }
    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }
    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }
    public BigDecimal getClosingBalance() { return closingBalance; }
    public void setClosingBalance(BigDecimal closingBalance) { this.closingBalance = closingBalance; }
    public Map<String, BigDecimal> getIncomeBreakdown() { return incomeBreakdown; }
    public void setIncomeBreakdown(Map<String, BigDecimal> incomeBreakdown) { this.incomeBreakdown = incomeBreakdown; }
    public Map<String, BigDecimal> getExpenseBreakdown() { return expenseBreakdown; }
    public void setExpenseBreakdown(Map<String, BigDecimal> expenseBreakdown) { this.expenseBreakdown = expenseBreakdown; }
}
