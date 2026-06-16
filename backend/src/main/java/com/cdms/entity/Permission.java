package com.cdms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "permissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"church_id", "role", "resource", "action"})
})
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(nullable = false, length = 50)
    private String role;

    @Column(nullable = false, length = 50)
    private String resource;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(nullable = false)
    private boolean allowed = true;

    public Permission() {}

    public Permission(Long churchId, String role, String resource, String action, boolean allowed) {
        this.churchId = churchId;
        this.role = role;
        this.resource = resource;
        this.action = action;
        this.allowed = allowed;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getResource() { return resource; }
    public void setResource(String resource) { this.resource = resource; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public boolean isAllowed() { return allowed; }
    public void setAllowed(boolean allowed) { this.allowed = allowed; }
}
