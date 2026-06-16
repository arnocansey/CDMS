package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class AnnouncementDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private LocalDate publishDate;
    private LocalDate expiryDate;
    private boolean published;
    private String createdBy;

    public AnnouncementDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDate getPublishDate() { return publishDate; }
    public void setPublishDate(LocalDate publishDate) { this.publishDate = publishDate; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
