package com.cdms.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class MemberContributionHistoryDto {
    private Long memberId;
    private String memberName;
    private BigDecimal totalContributions;
    private BigDecimal monthlyContributions;
    private BigDecimal annualContributions;
    private String contributionFrequency;
    private List<ContributionItem> contributions;

    public MemberContributionHistoryDto() {}

    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public BigDecimal getTotalContributions() { return totalContributions; }
    public void setTotalContributions(BigDecimal totalContributions) { this.totalContributions = totalContributions; }
    public BigDecimal getMonthlyContributions() { return monthlyContributions; }
    public void setMonthlyContributions(BigDecimal monthlyContributions) { this.monthlyContributions = monthlyContributions; }
    public BigDecimal getAnnualContributions() { return annualContributions; }
    public void setAnnualContributions(BigDecimal annualContributions) { this.annualContributions = annualContributions; }
    public String getContributionFrequency() { return contributionFrequency; }
    public void setContributionFrequency(String contributionFrequency) { this.contributionFrequency = contributionFrequency; }
    public List<ContributionItem> getContributions() { return contributions; }
    public void setContributions(List<ContributionItem> contributions) { this.contributions = contributions; }

    public static class ContributionItem {
        private Long id;
        private String type;
        private BigDecimal amount;
        private LocalDate date;
        private String description;

        public ContributionItem() {}

        public ContributionItem(Long id, String type, BigDecimal amount, LocalDate date, String description) {
            this.id = id;
            this.type = type;
            this.amount = amount;
            this.date = date;
            this.description = description;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}
