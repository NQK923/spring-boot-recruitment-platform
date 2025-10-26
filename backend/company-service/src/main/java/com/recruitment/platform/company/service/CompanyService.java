package com.recruitment.platform.company.service;

import com.recruitment.platform.company.client.AuthServiceClient;
import com.recruitment.platform.company.client.dto.InternalInviteRequest;
import com.recruitment.platform.company.dto.AddUserToCompanyRequest;
import com.recruitment.platform.company.dto.CompanyUserResponse;
import com.recruitment.platform.company.dto.CreateCompanyRequest;
import com.recruitment.platform.company.dto.UpdateCompanyRequest;
import com.recruitment.platform.company.dto.UserInviteRequest;
import com.recruitment.platform.company.model.Company;
import com.recruitment.platform.company.model.CompanyUser;
import com.recruitment.platform.company.model.CompanyUserPK;
import com.recruitment.platform.company.repository.CompanyRepository;
import com.recruitment.platform.company.repository.CompanyUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final AuthServiceClient authServiceClient;
    private final CompanyUserRepository companyUserRepository;
    private final CompanyRepository companyRepository;

    public CompanyService(AuthServiceClient authServiceClient,
                          CompanyUserRepository companyUserRepository,
                          CompanyRepository companyRepository) {
        this.authServiceClient = authServiceClient;
        this.companyUserRepository = companyUserRepository;
        this.companyRepository = companyRepository;
    }

    public void inviteUser(Long companyId, Long createdByUserId, UserInviteRequest inviteRequest) {
        // In a real app, you'd add more logic here:
        // 1. Verify the company exists (companyRepository.existsById(companyId)).
        // 2. Verify the calling user has permission to invite to this specific company.

        InternalInviteRequest internalRequest = new InternalInviteRequest(
                inviteRequest.email(),
                inviteRequest.role(),
                companyId,
                createdByUserId
        );
        authServiceClient.createInvitation(internalRequest);
    }

    public Optional<CompanyUser> findCompanyByUserId(Long userId) {
        return companyUserRepository.findById_UserId(userId);
    }

    public void addUserToCompany(AddUserToCompanyRequest request) {
        CompanyUserPK pk = new CompanyUserPK();
        pk.setCompanyId(request.companyId());
        pk.setUserId(request.userId());

        CompanyUser companyUser = new CompanyUser();
        companyUser.setId(pk);
        companyUser.setRole(request.role());

        companyUserRepository.save(companyUser);
    }

    public Company createCompany(CreateCompanyRequest request) {
        Company company = new Company();
        company.setName(request.name());
        company.setDescription(request.description());
        company.setWebsite(request.website());
        company.setLogoUrl(request.logoUrl());
        company.setCompanySize(request.companySize());
        company.setCompanyAddress(request.companyAddress());
        return companyRepository.save(company);
    }

    public Optional<Company> findCompany(Long companyId) {
        return companyRepository.findById(companyId);
    }

    @Transactional
    public Company updateCompany(Long companyId, UpdateCompanyRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));

        if (request.name() != null) {
            company.setName(request.name());
        }
        if (request.description() != null) {
            company.setDescription(request.description());
        }
        if (request.website() != null) {
            company.setWebsite(request.website());
        }
        if (request.logoUrl() != null) {
            company.setLogoUrl(request.logoUrl());
        }
        if (request.companySize() != null) {
            company.setCompanySize(request.companySize());
        }
        if (request.companyAddress() != null) {
            company.setCompanyAddress(request.companyAddress());
        }
        return companyRepository.save(company);
    }

    public List<Company> findAllCompanies() {
        return companyRepository.findAll();
    }

    public List<Company> searchCompanies(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return companyRepository.findByNameContainingIgnoreCase(query.trim());
    }

    public List<CompanyUserResponse> getCompanyUsers(Long companyId) {
        List<CompanyUser> members = companyUserRepository.findById_CompanyId(companyId);
        if (members.isEmpty()) {
            return List.of();
        }

        List<Long> userIds = members.stream()
                .map(member -> member.getId().getUserId())
                .distinct()
                .toList();

        Map<Long, String> emailMap = Collections.emptyMap();
        if (!userIds.isEmpty()) {
            List<AuthServiceClient.UserEmailInfo> userInfos =
                    authServiceClient.getUsersByIds(new AuthServiceClient.BatchUserIdsRequest(userIds));
            emailMap = userInfos.stream()
                    .collect(Collectors.toMap(AuthServiceClient.UserEmailInfo::id, AuthServiceClient.UserEmailInfo::email));
        }

        Map<Long, String> finalEmailMap = emailMap;
        return members.stream()
                .map(member -> new CompanyUserResponse(
                        member.getId().getUserId(),
                        finalEmailMap.get(member.getId().getUserId()),
                        member.getRole()
                ))
                .collect(Collectors.toList());
    }
}
