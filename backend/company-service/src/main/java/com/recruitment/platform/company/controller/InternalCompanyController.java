package com.recruitment.platform.company.controller;

import com.recruitment.platform.company.dto.AddUserToCompanyRequest;
import com.recruitment.platform.company.model.CompanyUser;
import com.recruitment.platform.company.model.CompanyUserPK;
import com.recruitment.platform.company.repository.CompanyUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/companies")
public class InternalCompanyController {

    private final CompanyUserRepository companyUserRepository;

    public InternalCompanyController(CompanyUserRepository companyUserRepository) {
        this.companyUserRepository = companyUserRepository;
    }

    @PostMapping("/users")
    public ResponseEntity<?> addUserToCompany(@RequestBody AddUserToCompanyRequest request) {
        CompanyUserPK pk = new CompanyUserPK();
        pk.setCompanyId(request.companyId());
        pk.setUserId(request.userId());

        CompanyUser companyUser = new CompanyUser();
        companyUser.setId(pk);
        companyUser.setRole(request.role());

        companyUserRepository.save(companyUser);

        return ResponseEntity.ok().build();
    }
}
