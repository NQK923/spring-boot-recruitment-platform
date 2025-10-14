package com.recruitment.platform.company.controller;

import com.recruitment.platform.company.client.AuthServiceClient;
import com.recruitment.platform.company.client.dto.InternalInviteRequest;
import com.recruitment.platform.company.dto.UserInviteRequest;
import com.recruitment.platform.company.model.Company;
import com.recruitment.platform.company.repository.CompanyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyRepository companyRepository;
    private final AuthServiceClient authServiceClient;

    public CompanyController(CompanyRepository companyRepository, AuthServiceClient authServiceClient) {
        this.companyRepository = companyRepository;
        this.authServiceClient = authServiceClient;
    }

    @GetMapping
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @PostMapping("/{companyId}/invites")
    public ResponseEntity<?> inviteUser(@PathVariable Long companyId, @RequestBody UserInviteRequest inviteRequest) {
        // In a real app, you'd check if the caller has permission to invite to this company.
        InternalInviteRequest internalRequest = new InternalInviteRequest(
                inviteRequest.email(),
                inviteRequest.role(),
                companyId
        );
        authServiceClient.createInvitation(internalRequest);
        return ResponseEntity.ok("Invitation request sent.");
    }
}
