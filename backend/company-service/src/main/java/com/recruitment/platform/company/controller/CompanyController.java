package com.recruitment.platform.company.controller;

import com.recruitment.platform.company.dto.CompanyUserResponse;
import com.recruitment.platform.company.dto.CreateCompanyRequest;
import com.recruitment.platform.company.dto.UpdateCompanyRequest;
import com.recruitment.platform.company.dto.UserInviteRequest;
import com.recruitment.platform.company.model.Company;
import com.recruitment.platform.company.service.CompanyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private static final String SUPER_ADMIN = "SUPER_ADMIN";
    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_SUPER_ADMIN')")
    public List<Company> getAllCompanies() {
        return companyService.findAllCompanies();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_SUPER_ADMIN')")
    public ResponseEntity<Company> createCompany(@RequestBody CreateCompanyRequest request) {
        Company created = companyService.createCompany(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{companyId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_SUPER_ADMIN', 'SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<Company> getCompany(@PathVariable Long companyId,
                                              @RequestHeader(value = "X-Company-ID", required = false) Long requesterCompanyId,
                                              @AuthenticationPrincipal Jwt jwt) {
        if (!isSuperAdmin(jwt)) {
            if (!Objects.equals(companyId, requesterCompanyId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return companyService.findCompany(companyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{companyId}")
    @PreAuthorize("hasAuthority('SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<Company> updateCompany(@PathVariable Long companyId,
                                                 @RequestBody UpdateCompanyRequest request,
                                                 @RequestHeader(value = "X-Company-ID", required = false) Long requesterCompanyId) {
        if (!Objects.equals(companyId, requesterCompanyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Company updated = companyService.updateCompany(companyId, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{companyId}/users/invite")
    @PreAuthorize("hasAuthority('SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<?> inviteUser(@PathVariable Long companyId,
                                        @RequestBody UserInviteRequest inviteRequest,
                                        @RequestHeader(value = "X-Company-ID", required = false) Long requesterCompanyId) {
        if (!Objects.equals(companyId, requesterCompanyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        companyService.inviteUser(companyId, inviteRequest);
        return ResponseEntity.ok("Invitation sent successfully.");
    }

    @GetMapping("/{companyId}/users")
    @PreAuthorize("hasAnyAuthority('SCOPE_SUPER_ADMIN', 'SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<List<CompanyUserResponse>> getCompanyUsers(@PathVariable Long companyId,
                                                                     @RequestHeader(value = "X-Company-ID", required = false) Long requesterCompanyId,
                                                                     @AuthenticationPrincipal Jwt jwt) {
        if (!isSuperAdmin(jwt)) {
            if (!Objects.equals(companyId, requesterCompanyId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return ResponseEntity.ok(companyService.getCompanyUsers(companyId));
    }

    private boolean isSuperAdmin(Jwt jwt) {
        if (jwt == null) {
            return false;
        }
        Object rolesClaim = jwt.getClaim("roles");
        if (rolesClaim instanceof Collection<?> collection) {
            return collection.stream().anyMatch(role -> SUPER_ADMIN.equalsIgnoreCase(String.valueOf(role)));
        }
        return false;
    }
}
