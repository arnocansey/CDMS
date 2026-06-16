package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EventDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private LocalDate eventDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private boolean recurring;
    private String createdBy;

    public EventDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public boolean isRecurring() { return recurring; }
    public void setRecurring(boolean recurring) { this.recurring = recurring; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
