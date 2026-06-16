package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BudgetDto {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private BigDecimal spent;
    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;

    public BudgetDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BigDecimal getSpent() { return spent; }
    public void setSpent(BigDecimal spent) { this.spent = spent; }
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
