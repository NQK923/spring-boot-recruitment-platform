package com.recruitment.platform.company.controller;

import com.recruitment.platform.company.dto.CompanyDashboardResponse;
import com.recruitment.platform.company.dto.SuperAdminDashboardResponse;
import com.recruitment.platform.company.service.DashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.Objects;

@RestController
@RequestMapping("/api/companies/dashboard")
public class DashboardController {

    private static final String SUPER_ADMIN = "SUPER_ADMIN";
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/super-admin")
    @PreAuthorize("hasAuthority('SCOPE_SUPER_ADMIN')")
    public SuperAdminDashboardResponse getSuperAdminDashboard() {
        return dashboardService.getSuperAdminDashboard();
    }

    @GetMapping("/{companyId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_SUPER_ADMIN', 'SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<CompanyDashboardResponse> getCompanyDashboard(@PathVariable Long companyId,
                                                                        @RequestHeader(value = "X-Company-ID", required = false) Long requesterCompanyId,
                                                                        @AuthenticationPrincipal Jwt jwt) {
        if (!isSuperAdmin(jwt) && !Objects.equals(companyId, requesterCompanyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            return ResponseEntity.ok(dashboardService.getCompanyDashboard(companyId));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<CompanyDashboardResponse> getMyCompanyDashboard(
            @RequestHeader(value = "X-Company-ID", required = false) Long companyId) {
        if (companyId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        try {
            return ResponseEntity.ok(dashboardService.getCompanyDashboard(companyId));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
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
