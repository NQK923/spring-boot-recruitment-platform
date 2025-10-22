package com.recruitment.platform.company.repository;

import com.recruitment.platform.company.model.CompanyUser;
import com.recruitment.platform.company.model.CompanyUserPK;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyUserRepository extends JpaRepository<CompanyUser, CompanyUserPK> {
    Optional<CompanyUser> findById_UserId(Long userId);
    List<CompanyUser> findById_CompanyId(Long companyId);
    long countById_CompanyId(Long companyId);
    long countById_CompanyIdAndRole(Long companyId, String role);
}
