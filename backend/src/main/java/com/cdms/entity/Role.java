package com.cdms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @Enumerated(EnumType.STRING)
    private RoleName name;

    public Role() {}

    public Role(RoleName name) {
        this.name = name;
    }

    public enum RoleName {
        ROLE_PLATFORM_ADMIN,
        ROLE_ADMIN,
        ROLE_PASTOR,
        ROLE_SECRETARY,
        ROLE_TREASURER,
        ROLE_DEPARTMENT_LEADER,
        ROLE_MEMBER
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public RoleName getName() { return name; }
    public void setName(RoleName name) { this.name = name; }
}
