package com.recruitment.platform.company.repository;

import com.recruitment.platform.company.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> { }
