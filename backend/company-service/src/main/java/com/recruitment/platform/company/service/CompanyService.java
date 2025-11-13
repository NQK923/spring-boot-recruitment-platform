package com.recruitment.platform.company.service;

import com.recruitment.platform.company.client.AuthServiceClient;
import com.recruitment.platform.company.client.dto.InternalInviteRequest;
import com.recruitment.platform.company.dto.AddUserToCompanyRequest;
import com.recruitment.platform.company.dto.CompanyUserResponse;
import com.recruitment.platform.company.dto.CreateCompanyRequest;
import com.recruitment.platform.company.dto.UpdateCompanyRequest;
import com.recruitment.platform.company.dto.UserInviteRequest;
import com.recruitment.platform.company.event.CompanyStatusChangedEvent;
import com.recruitment.platform.company.event.CompanyUserLockedEvent;
import com.recruitment.platform.company.model.Company;
import com.recruitment.platform.company.model.CompanyStatus;
import com.recruitment.platform.company.model.CompanyUser;
import com.recruitment.platform.company.model.CompanyUserPK;
import com.recruitment.platform.common.exception.NotFoundException;
import com.recruitment.platform.company.repository.CompanyRepository;
import com.recruitment.platform.company.repository.CompanyUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private static final Logger log = LoggerFactory.getLogger(CompanyService.class);
    private static final String COMPANY_USER_LOCKED_BINDING = "companyUserLocked-out-0";
    private static final String COMPANY_STATUS_CHANGED_BINDING = "companyStatusChanged-out-0";

    private final AuthServiceClient authServiceClient;
    private final CompanyUserRepository companyUserRepository;
    private final CompanyRepository companyRepository;
    private final StreamBridge streamBridge;

    public CompanyService(AuthServiceClient authServiceClient,
                          CompanyUserRepository companyUserRepository,
                          CompanyRepository companyRepository,
                          StreamBridge streamBridge) {
        this.authServiceClient = authServiceClient;
        this.companyUserRepository = companyUserRepository;
        this.companyRepository = companyRepository;
        this.streamBridge = streamBridge;
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
        company.setStatus(Optional.ofNullable(request.status()).orElse(CompanyStatus.PENDING));
        return companyRepository.save(company);
    }

    public Optional<Company> findCompany(Long companyId) {
        return companyRepository.findById(companyId);
    }

    @Transactional
    public Company updateCompany(Long companyId, UpdateCompanyRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new NotFoundException("Company not found"));

        CompanyStatus previousStatus = company.getStatus();
        boolean statusWillChange = request.status() != null && !request.status().equals(previousStatus);

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
        if (request.status() != null) {
            company.setStatus(request.status());
        }
        Company saved = companyRepository.save(company);

        if (statusWillChange) {
            publishCompanyStatusChangedEvent(saved, previousStatus, saved.getStatus());
        }

        return saved;
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
                        member.getRole(),
                        member.isLocked()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public CompanyUser updateCompanyUser(Long companyId, Long userId, String role, Boolean locked) {
        CompanyUserPK pk = new CompanyUserPK();
        pk.setCompanyId(companyId);
        pk.setUserId(userId);

        CompanyUser companyUser = companyUserRepository.findById(pk)
                .orElseThrow(() -> new NotFoundException("Company user relationship not found"));

        if (role != null && !role.isBlank()) {
            companyUser.setRole(role);
        }
        boolean publishLockEvent = false;
        if (locked != null) {
            boolean previousLocked = companyUser.isLocked();
            companyUser.setLocked(locked);
            publishLockEvent = locked && !previousLocked;
        }

        CompanyUser saved = companyUserRepository.save(companyUser);

        if (publishLockEvent) {
            String companyName = companyRepository.findById(companyId)
                    .map(Company::getName)
                    .orElse(null);
            publishCompanyUserLockedEvent(companyId, companyName, userId);
        }

        return saved;
    }

    private void publishCompanyUserLockedEvent(Long companyId, String companyName, Long userId) {
        CompanyUserLockedEvent event = new CompanyUserLockedEvent(
                companyId,
                companyName,
                userId,
                true,
                Instant.now()
        );
        boolean accepted = streamBridge.send(COMPANY_USER_LOCKED_BINDING, event);
        if (!accepted) {
            log.warn("Failed to publish company user locked event for user {} in company {}", userId, companyId);
        }
    }

    private void publishCompanyStatusChangedEvent(Company company,
                                                  CompanyStatus previousStatus,
                                                  CompanyStatus newStatus) {
        List<Long> adminUserIds = getCompanyAdminUserIds(company.getId());
        CompanyStatusChangedEvent event = new CompanyStatusChangedEvent(
                company.getId(),
                company.getName(),
                previousStatus,
                newStatus,
                adminUserIds,
                Instant.now()
        );
        boolean accepted = streamBridge.send(COMPANY_STATUS_CHANGED_BINDING, event);
        if (!accepted) {
            log.warn("Failed to publish company status change for company {}", company.getId());
        }
    }

    private List<Long> getCompanyAdminUserIds(Long companyId) {
        return companyUserRepository.findById_CompanyId(companyId).stream()
                .filter(member -> member.getRole() != null && member.getRole().equalsIgnoreCase("COMPANY_ADMIN"))
                .map(member -> member.getId().getUserId())
                .distinct()
                .toList();
    }

    public Map<Long, CompanyStatus> getCompanyStatuses(List<Long> companyIds) {
        if (companyIds == null || companyIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return companyRepository.findAllById(companyIds).stream()
                .collect(Collectors.toMap(
                        Company::getId,
                        Company::getStatus,
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));
    }

    public List<Company> findCompanies(List<Long> companyIds) {
        if (companyIds == null || companyIds.isEmpty()) {
            return Collections.emptyList();
        }
        return companyRepository.findAllById(companyIds);
    }

    public List<Long> findCompanyIdsByStatus(CompanyStatus status) {
        if (status == null) {
            return Collections.emptyList();
        }
        List<Long> ids = companyRepository.findIdsByStatus(status);
        return ids != null ? ids : Collections.emptyList();
    }
}
