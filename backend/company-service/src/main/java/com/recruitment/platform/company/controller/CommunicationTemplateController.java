package com.recruitment.platform.company.controller;

import com.recruitment.platform.company.dto.CommunicationTemplateResponse;
import com.recruitment.platform.company.dto.CreateCommunicationTemplateRequest;
import com.recruitment.platform.company.dto.UpdateCommunicationTemplateRequest;
import com.recruitment.platform.company.model.TemplateCategory;
import com.recruitment.platform.company.service.CommunicationTemplateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/api/companies/templates")
public class CommunicationTemplateController {

    private static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";
    private static final String ROLE_COMPANY_ADMIN = "COMPANY_ADMIN";
    private static final String ROLE_RECRUITER = "RECRUITER";

    private final CommunicationTemplateService templateService;

    public CommunicationTemplateController(CommunicationTemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CommunicationTemplateResponse>> listTemplates(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Company-ID", required = false) Long headerCompanyId,
            @RequestParam(value = "companyId", required = false) Long companyIdParam,
            @RequestParam(value = "category", required = false) String categoryParam,
            @RequestParam(value = "includeGlobal", required = false, defaultValue = "true") boolean includeGlobal) {

        boolean superAdmin = hasRole(jwt, ROLE_SUPER_ADMIN);
        boolean companyAdmin = hasRole(jwt, ROLE_COMPANY_ADMIN);
        boolean recruiter = hasRole(jwt, ROLE_RECRUITER);

        if (!superAdmin && !companyAdmin && !recruiter) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long effectiveCompanyId = superAdmin ? companyIdParam : headerCompanyId;
        if (!superAdmin && effectiveCompanyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        TemplateCategory category = parseCategory(categoryParam);

        boolean includePrivateCompanyTemplates = superAdmin || companyAdmin;
        if (!superAdmin && recruiter) {
            includePrivateCompanyTemplates = false;
        }

        boolean includeGlobalTemplates = includeGlobal;
        boolean includeGlobalUnshared = superAdmin;

        List<CommunicationTemplateResponse> responses = templateService.listTemplates(
                effectiveCompanyId,
                category,
                includePrivateCompanyTemplates,
                includeGlobalTemplates,
                includeGlobalUnshared
        );

        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SCOPE_SUPER_ADMIN', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<CommunicationTemplateResponse> createTemplate(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Company-ID", required = false) Long headerCompanyId,
            @RequestBody CreateCommunicationTemplateRequest request) {

        boolean superAdmin = hasRole(jwt, ROLE_SUPER_ADMIN);
        boolean companyAdmin = hasRole(jwt, ROLE_COMPANY_ADMIN);
        if (!superAdmin && !companyAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long creatorId = Long.valueOf(jwt.getSubject());
        Long targetCompanyId = superAdmin ? request.companyId() : headerCompanyId;

        if (!superAdmin && targetCompanyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        if (!superAdmin && request.companyId() != null && !request.companyId().equals(headerCompanyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        CommunicationTemplateResponse response = templateService.createTemplate(targetCompanyId, creatorId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{templateId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_SUPER_ADMIN', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<CommunicationTemplateResponse> updateTemplate(
            @PathVariable Long templateId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Company-ID", required = false) Long headerCompanyId,
            @RequestBody UpdateCommunicationTemplateRequest request) {

        boolean superAdmin = hasRole(jwt, ROLE_SUPER_ADMIN);
        boolean companyAdmin = hasRole(jwt, ROLE_COMPANY_ADMIN);
        if (!superAdmin && !companyAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long userId = Long.valueOf(jwt.getSubject());
        Long targetCompanyId = superAdmin ? null : headerCompanyId;

        if (!superAdmin && targetCompanyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        CommunicationTemplateResponse response =
                templateService.updateTemplate(templateId, targetCompanyId, userId, request, superAdmin);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{templateId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_SUPER_ADMIN', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long templateId,
                                               @AuthenticationPrincipal Jwt jwt,
                                               @RequestHeader(value = "X-Company-ID", required = false) Long headerCompanyId) {
        boolean superAdmin = hasRole(jwt, ROLE_SUPER_ADMIN);
        boolean companyAdmin = hasRole(jwt, ROLE_COMPANY_ADMIN);
        if (!superAdmin && !companyAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long targetCompanyId = superAdmin ? null : headerCompanyId;
        if (!superAdmin && targetCompanyId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        templateService.deleteTemplate(templateId, targetCompanyId, superAdmin);
        return ResponseEntity.noContent().build();
    }

    private boolean hasRole(Jwt jwt, String role) {
        if (jwt == null) {
            return false;
        }
        Object claim = jwt.getClaim("roles");
        if (claim instanceof Collection<?> collection) {
            return collection.stream().anyMatch(item -> role.equalsIgnoreCase(String.valueOf(item)));
        }
        return false;
    }

    private TemplateCategory parseCategory(String categoryParam) {
        if (categoryParam == null || categoryParam.isBlank()) {
            return null;
        }
        return TemplateCategory.valueOf(categoryParam.trim().toUpperCase());
    }
}
