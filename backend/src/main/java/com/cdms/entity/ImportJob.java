package com.cdms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "import_jobs")
public class ImportJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(name = "import_type", nullable = false)
    private String importType;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "total_rows")
    private Integer totalRows = 0;

    @Column(name = "processed_rows")
    private Integer processedRows = 0;

    @Column(name = "success_rows")
    private Integer successRows = 0;

    @Column(name = "error_rows")
    private Integer errorRows = 0;

    @Column(columnDefinition = "TEXT")
    private String errors;

    @Column(name = "filename")
    private String filename;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public ImportJob() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public String getImportType() { return importType; }
    public void setImportType(String importType) { this.importType = importType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getTotalRows() { return totalRows; }
    public void setTotalRows(Integer totalRows) { this.totalRows = totalRows; }
    public Integer getProcessedRows() { return processedRows; }
    public void setProcessedRows(Integer processedRows) { this.processedRows = processedRows; }
    public Integer getSuccessRows() { return successRows; }
    public void setSuccessRows(Integer successRows) { this.successRows = successRows; }
    public Integer getErrorRows() { return errorRows; }
    public void setErrorRows(Integer errorRows) { this.errorRows = errorRows; }
    public String getErrors() { return errors; }
    public void setErrors(String errors) { this.errors = errors; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
