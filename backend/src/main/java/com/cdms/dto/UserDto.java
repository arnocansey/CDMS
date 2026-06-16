package com.cdms.dto;

import java.time.LocalDateTime;
import java.util.List;

public class UserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private boolean enabled;
    private String accountStatus;
    private List<String> roles;
    private LocalDateTime createdAt;

    public UserDto() {}

    public UserDto(Long id, String email, String firstName, String lastName, boolean enabled, String accountStatus, List<String> roles) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.enabled = enabled;
        this.accountStatus = accountStatus;
        this.roles = roles;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
