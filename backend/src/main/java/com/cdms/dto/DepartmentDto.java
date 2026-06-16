package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;

public class DepartmentDto {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;
    private Long leaderId;
    private String leaderName;

    public DepartmentDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getLeaderId() { return leaderId; }
    public void setLeaderId(Long leaderId) { this.leaderId = leaderId; }
    public String getLeaderName() { return leaderName; }
    public void setLeaderName(String leaderName) { this.leaderName = leaderName; }
}
