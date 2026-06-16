package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "churches")
public class Church {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(unique = true)
    private String email;

    private String phone;

    private String address;

    private String city;

    private String state;

    @Column(name = "zip_code")
    private String zipCode;

    private String timezone = "America/New_York";

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(length = 3)
    private String currency = "USD";

    @Column(name = "currency_symbol", length = 5)
    private String currencySymbol = "$";

    @Column(name = "fiscal_year_start")
    private Integer fiscalYearStart = 1;

    @Column(name = "email_from_name")
    private String emailFromName;

    @Column(name = "email_from_address")
    private String emailFromAddress;

    private String website;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "expense_approval_threshold", precision = 10, scale = 2)
    private BigDecimal expenseApprovalThreshold = BigDecimal.ZERO;

    @Column(name = "primary_color", length = 7)
    private String primaryColor = "#2563eb";

    @Column(name = "secondary_color", length = 7)
    private String secondaryColor = "#1e40af";

    @Column(name = "custom_css", columnDefinition = "TEXT")
    private String customCss;

    @Column(name = "logo_dark_url", length = 500)
    private String logoDarkUrl;

    @Column(name = "favicon_url", length = 500)
    private String faviconUrl;

    @Column(name = "custom_domain", length = 255)
    private String customDomain;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Church() {}

    public Church(String name, String slug) {
        this.name = name;
        this.slug = slug;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }
    public Integer getFiscalYearStart() { return fiscalYearStart; }
    public void setFiscalYearStart(Integer fiscalYearStart) { this.fiscalYearStart = fiscalYearStart; }
    public String getEmailFromName() { return emailFromName; }
    public void setEmailFromName(String emailFromName) { this.emailFromName = emailFromName; }
    public String getEmailFromAddress() { return emailFromAddress; }
    public void setEmailFromAddress(String emailFromAddress) { this.emailFromAddress = emailFromAddress; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public BigDecimal getExpenseApprovalThreshold() { return expenseApprovalThreshold; }
    public void setExpenseApprovalThreshold(BigDecimal expenseApprovalThreshold) { this.expenseApprovalThreshold = expenseApprovalThreshold; }
    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }
    public String getSecondaryColor() { return secondaryColor; }
    public void setSecondaryColor(String secondaryColor) { this.secondaryColor = secondaryColor; }
    public String getCustomCss() { return customCss; }
    public void setCustomCss(String customCss) { this.customCss = customCss; }
    public String getLogoDarkUrl() { return logoDarkUrl; }
    public void setLogoDarkUrl(String logoDarkUrl) { this.logoDarkUrl = logoDarkUrl; }
    public String getFaviconUrl() { return faviconUrl; }
    public void setFaviconUrl(String faviconUrl) { this.faviconUrl = faviconUrl; }
    public String getCustomDomain() { return customDomain; }
    public void setCustomDomain(String customDomain) { this.customDomain = customDomain; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
