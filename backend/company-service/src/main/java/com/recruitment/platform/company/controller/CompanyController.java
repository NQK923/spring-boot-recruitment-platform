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

    private Long requireCompanyId(Long requesterCompanyId) {
        if (requesterCompanyId == null) {
            throw new IllegalStateException("Company context not available in request headers");
        }
        return requesterCompanyId;
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
    @PreAuthorize("hasAnyAuthority('SCOPE_COMPANY_ADMIN', 'SCOPE_SUPER_ADMIN')")
    public ResponseEntity<Company> updateCompany(@PathVariable Long companyId,
                                                 @RequestBody UpdateCompanyRequest request,
                                                 @RequestHeader(value = "X-Company-ID", required = false) Long requesterCompanyId,
                                                 @AuthenticationPrincipal Jwt jwt) {
        if (!isSuperAdmin(jwt) && !Objects.equals(companyId, requesterCompanyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Company updated = companyService.updateCompany(companyId, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('SCOPE_COMPANY_ADMIN', 'SCOPE_RECRUITER')")
    public ResponseEntity<Company> getMyCompany(
            @RequestHeader(value = "X-Company-ID", required = false) Long requesterCompanyId) {
        try {
            Long companyId = requireCompanyId(requesterCompanyId);
            return companyService.findCompany(companyId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<?> updateMyCompany(@RequestBody UpdateCompanyRequest request,
                                             @RequestHeader(value = "X-Company-ID", required = false) Long requesterCompanyId) {
        try {
            Long companyId = requireCompanyId(requesterCompanyId);
            Company updated = companyService.updateCompany(companyId, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Company context missing");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Company not found");
        }
    }

    @GetMapping("/me/users")
    @PreAuthorize("hasAuthority('SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<List<CompanyUserResponse>> getMyCompanyUsers(
            @RequestHeader(value = "X-Company-ID", required = false) Long requesterCompanyId) {
        try {
            Long companyId = requireCompanyId(requesterCompanyId);
            return ResponseEntity.ok(companyService.getCompanyUsers(companyId));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/{companyId}/users/invite")
    @PreAuthorize("hasAnyAuthority('SCOPE_COMPANY_ADMIN', 'SCOPE_SUPER_ADMIN')")
    public ResponseEntity<?> inviteUser(@PathVariable Long companyId,
                                        @RequestBody UserInviteRequest inviteRequest,
                                        @RequestHeader(value = "X-Company-ID", required = false) Long requesterCompanyId,
                                        @AuthenticationPrincipal Jwt jwt) {
        if (!isSuperAdmin(jwt)) {
            if (!Objects.equals(companyId, requesterCompanyId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        Long createdByUserId = jwt != null ? Long.valueOf(jwt.getSubject()) : null;
        companyService.inviteUser(companyId, createdByUserId, inviteRequest);
        return ResponseEntity.ok("Invitation sent successfully.");
    }

    @PostMapping("/me/users/invite")
    @PreAuthorize("hasAuthority('SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<?> inviteUserForCurrentCompany(@RequestBody UserInviteRequest inviteRequest,
                                                         @RequestHeader(value = "X-Company-ID", required = false) Long requesterCompanyId,
                                                         @AuthenticationPrincipal Jwt jwt) {
        try {
            Long companyId = requireCompanyId(requesterCompanyId);
            Long createdByUserId = jwt != null ? Long.valueOf(jwt.getSubject()) : null;
            companyService.inviteUser(companyId, createdByUserId, inviteRequest);
            return ResponseEntity.ok("Invitation sent successfully.");
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Company context missing");
        }
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
