package com.recruitment.platform.gateway.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Setter
@Getter
public class CompanyUserPK implements Serializable {
    // Getters & Setters
    private Long companyId;
    private Long userId;

}
