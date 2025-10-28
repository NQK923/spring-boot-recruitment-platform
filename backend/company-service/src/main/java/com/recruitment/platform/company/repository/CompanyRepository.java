package com.recruitment.platform.company.repository;

import com.recruitment.platform.company.model.Company;
import com.recruitment.platform.company.model.CompanyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByNameContainingIgnoreCase(String name);

    @Query("SELECT c.id FROM Company c WHERE c.status = :status")
    List<Long> findIdsByStatus(@Param("status") CompanyStatus status);
}
