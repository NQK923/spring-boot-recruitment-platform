package com.recruitment.platform.company.controller;

import com.recruitment.platform.company.dto.UserInviteRequest;
import com.recruitment.platform.company.model.Company;
import com.recruitment.platform.company.repository.CompanyRepository;
import com.recruitment.platform.company.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyRepository companyRepository; // Keep for now for GET endpoint
    private final CompanyService companyService;

    public CompanyController(CompanyRepository companyRepository, CompanyService companyService) {
        this.companyRepository = companyRepository;
        this.companyService = companyService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_SUPER_ADMIN')")
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @PostMapping("/{companyId}/invites")
    @PreAuthorize("hasAuthority('SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<?> inviteUser(@PathVariable Long companyId, @RequestBody UserInviteRequest inviteRequest) {
        // TODO: Add logic to verify that the calling admin belongs to the companyId
        companyService.inviteUser(companyId, inviteRequest);
        return ResponseEntity.ok("Invitation sent successfully.");
    }
}
