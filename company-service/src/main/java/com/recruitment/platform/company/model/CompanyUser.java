package com.recruitment.platform.company.model;

import jakarta.persistence.*;

@Entity
@Table(name = "company_users")
public class CompanyUser {
    @EmbeddedId
    private CompanyUserPK id;

    private String role;

    public CompanyUserPK getId() { return id; }
    public void setId(CompanyUserPK id) { this.id = id; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
