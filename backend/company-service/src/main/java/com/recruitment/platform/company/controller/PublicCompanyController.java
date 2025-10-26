package com.recruitment.platform.company.controller;

import com.recruitment.platform.company.dto.PublicCompanyResponses;
import com.recruitment.platform.company.model.Company;
import com.recruitment.platform.company.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/companies/public")
public class PublicCompanyController {

    private final CompanyService companyService;

    public PublicCompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<PublicCompanyResponses.Profile> getCompanyProfile(@PathVariable Long companyId) {
        return companyService.findCompany(companyId)
                .map(this::toProfile)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<PublicCompanyResponses.Summary> searchCompanies(@RequestParam("query") String query) {
        if (!StringUtils.hasText(query)) {
            return List.of();
        }
        return companyService.searchCompanies(query).stream()
                .map(company -> new PublicCompanyResponses.Summary(company.getId(), company.getName()))
                .toList();
    }

    private PublicCompanyResponses.Profile toProfile(Company company) {
        return new PublicCompanyResponses.Profile(
                company.getId(),
                company.getName(),
                company.getDescription(),
                company.getWebsite(),
                company.getLogoUrl(),
                company.getCompanySize(),
                company.getCompanyAddress()
        );
    }
}
