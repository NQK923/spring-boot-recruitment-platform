package com.recruitment.platform.company.controller;

import com.recruitment.platform.company.dto.AddUserToCompanyRequest;
import com.recruitment.platform.company.model.CompanyUser;
import com.recruitment.platform.company.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/companies")
public class InternalCompanyController {

    private final CompanyService companyService;

    public InternalCompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    // This endpoint is called by auth-service when an invitation is accepted
    @PostMapping("/users")
    public ResponseEntity<?> addUserToCompany(@RequestBody AddUserToCompanyRequest request) {
        // This logic should be in the service layer, but for now it's simple enough.
        companyService.addUserToCompany(request);
        return ResponseEntity.ok().build();
    }

    // This endpoint will be called by the gateway to enrich requests
    @GetMapping("/users/{userId}/company")
    public ResponseEntity<CompanyUser> getCompanyForUser(@PathVariable Long userId) {
        return companyService.findCompanyByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
