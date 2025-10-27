package com.recruitment.platform.company.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "company_users")
public class CompanyUser {
    @EmbeddedId
    private CompanyUserPK id;

    private String role;
    private boolean locked = false;

}
