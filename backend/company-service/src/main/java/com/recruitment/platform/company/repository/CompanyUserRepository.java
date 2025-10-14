package com.recruitment.platform.company.repository;

import com.recruitment.platform.company.model.CompanyUser;
import com.recruitment.platform.company.model.CompanyUserPK;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyUserRepository extends JpaRepository<CompanyUser, CompanyUserPK> { }
