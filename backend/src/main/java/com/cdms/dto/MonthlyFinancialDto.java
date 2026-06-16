package com.cdms.dto;

import java.math.BigDecimal;

public class MonthlyFinancialDto {
    private String month;
    private BigDecimal donations;
    private BigDecimal expenses;

    public MonthlyFinancialDto() {}

    public MonthlyFinancialDto(String month, BigDecimal donations, BigDecimal expenses) {
        this.month = month;
        this.donations = donations;
        this.expenses = expenses;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public BigDecimal getDonations() { return donations; }
    public void setDonations(BigDecimal donations) { this.donations = donations; }
    public BigDecimal getExpenses() { return expenses; }
    public void setExpenses(BigDecimal expenses) { this.expenses = expenses; }
}
