package com.cdms.dto;

import java.math.BigDecimal;
import java.util.List;

public class DecisionSupportDto {
    private String highestIncomeSource;
    private BigDecimal highestIncomeAmount;
    private String highestExpenseCategory;
    private BigDecimal highestExpenseAmount;
    private String bestPerformingFund;
    private BigDecimal bestPerformingFundBalance;
    private List<String> underfundedProjects;
    private List<String> budgetRisks;
    private List<String> cashFlowWarnings;

    public DecisionSupportDto() {}

    public String getHighestIncomeSource() { return highestIncomeSource; }
    public void setHighestIncomeSource(String highestIncomeSource) { this.highestIncomeSource = highestIncomeSource; }
    public BigDecimal getHighestIncomeAmount() { return highestIncomeAmount; }
    public void setHighestIncomeAmount(BigDecimal highestIncomeAmount) { this.highestIncomeAmount = highestIncomeAmount; }
    public String getHighestExpenseCategory() { return highestExpenseCategory; }
    public void setHighestExpenseCategory(String highestExpenseCategory) { this.highestExpenseCategory = highestExpenseCategory; }
    public BigDecimal getHighestExpenseAmount() { return highestExpenseAmount; }
    public void setHighestExpenseAmount(BigDecimal highestExpenseAmount) { this.highestExpenseAmount = highestExpenseAmount; }
    public String getBestPerformingFund() { return bestPerformingFund; }
    public void setBestPerformingFund(String bestPerformingFund) { this.bestPerformingFund = bestPerformingFund; }
    public BigDecimal getBestPerformingFundBalance() { return bestPerformingFundBalance; }
    public void setBestPerformingFundBalance(BigDecimal bestPerformingFundBalance) { this.bestPerformingFundBalance = bestPerformingFundBalance; }
    public List<String> getUnderfundedProjects() { return underfundedProjects; }
    public void setUnderfundedProjects(List<String> underfundedProjects) { this.underfundedProjects = underfundedProjects; }
    public List<String> getBudgetRisks() { return budgetRisks; }
    public void setBudgetRisks(List<String> budgetRisks) { this.budgetRisks = budgetRisks; }
    public List<String> getCashFlowWarnings() { return cashFlowWarnings; }
    public void setCashFlowWarnings(List<String> cashFlowWarnings) { this.cashFlowWarnings = cashFlowWarnings; }
}
