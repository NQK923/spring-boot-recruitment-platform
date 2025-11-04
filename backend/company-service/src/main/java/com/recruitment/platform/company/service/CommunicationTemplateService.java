package com.recruitment.platform.company.service;

import com.recruitment.platform.common.exception.BadRequestException;
import com.recruitment.platform.common.exception.ForbiddenException;
import com.recruitment.platform.common.exception.NotFoundException;
import com.recruitment.platform.company.dto.CommunicationTemplateResponse;
import com.recruitment.platform.company.dto.CreateCommunicationTemplateRequest;
import com.recruitment.platform.company.dto.UpdateCommunicationTemplateRequest;
import com.recruitment.platform.company.model.CommunicationTemplate;
import com.recruitment.platform.company.model.TemplateCategory;
import com.recruitment.platform.company.repository.CommunicationTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CommunicationTemplateService {

    private final CommunicationTemplateRepository repository;

    public CommunicationTemplateService(CommunicationTemplateRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CommunicationTemplateResponse> listTemplates(Long companyId,
                                                             TemplateCategory category,
                                                             boolean includePrivateCompanyTemplates,
                                                             boolean includeGlobalTemplates,
                                                             boolean includeGlobalUnshared) {
        List<CommunicationTemplate> templates = new ArrayList<>();

        if (companyId != null) {
            List<CommunicationTemplate> companyTemplates = includePrivateCompanyTemplates
                    ? repository.findByCompanyId(companyId)
                    : repository.findByCompanyIdAndSharedWithRecruitersTrue(companyId);
            templates.addAll(filterByCategory(companyTemplates, category));
        }

        if (includeGlobalTemplates) {
            List<CommunicationTemplate> globalTemplates = includeGlobalUnshared
                    ? repository.findByCompanyIdIsNull()
                    : repository.findByCompanyIdIsNullAndSharedWithRecruitersTrue();
            templates.addAll(filterByCategory(globalTemplates, category));
        }

        return templates.stream()
                .sorted(Comparator
                        .comparing((CommunicationTemplate template) -> template.getCompanyId() == null ? 0L : template.getCompanyId())
                        .thenComparing(CommunicationTemplate::getName, String.CASE_INSENSITIVE_ORDER))
                .map(CommunicationTemplateResponse::fromEntity)
                .toList();
    }

    @Transactional
    public CommunicationTemplateResponse createTemplate(Long companyId,
                                                        Long userId,
                                                        CreateCommunicationTemplateRequest request) {
        TemplateCategory category = parseCategory(request.category());

        if (request.name() == null || request.name().isBlank()) {
            throw new BadRequestException("Template name is required");
        }
        if (request.body() == null || request.body().isBlank()) {
            throw new BadRequestException("Template body is required");
        }

        CommunicationTemplate template = new CommunicationTemplate();
        template.setCompanyId(companyId);
        template.setName(request.name().trim());
        template.setCategory(category);
        template.setSubject(request.subject());
        template.setBody(request.body());
        template.setSharedWithRecruiters(request.sharedWithRecruiters() == null || request.sharedWithRecruiters());
        template.setCreatedByUserId(userId);
        template.setUpdatedByUserId(userId);

        CommunicationTemplate saved = repository.save(template);
        return CommunicationTemplateResponse.fromEntity(saved);
    }

    @Transactional
    public CommunicationTemplateResponse updateTemplate(Long templateId,
                                                        Long companyId,
                                                        Long userId,
                                                        UpdateCommunicationTemplateRequest request,
                                                        boolean superAdmin) {
        CommunicationTemplate template = repository.findById(templateId)
                .orElseThrow(() -> new NotFoundException("Template not found"));

        if (!superAdmin) {
            if (!Objects.equals(template.getCompanyId(), companyId)) {
                throw new ForbiddenException("Template does not belong to this company");
            }
        }

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new BadRequestException("Template name cannot be blank");
            }
            template.setName(request.name().trim());
        }
        if (request.category() != null) {
            template.setCategory(parseCategory(request.category()));
        }
        if (request.subject() != null) {
            template.setSubject(request.subject());
        }
        if (request.body() != null) {
            if (request.body().isBlank()) {
                throw new BadRequestException("Template body cannot be blank");
            }
            template.setBody(request.body());
        }
        if (request.sharedWithRecruiters() != null) {
            template.setSharedWithRecruiters(request.sharedWithRecruiters());
        }
        template.setUpdatedByUserId(userId);

        CommunicationTemplate saved = repository.save(template);
        return CommunicationTemplateResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteTemplate(Long templateId, Long companyId, boolean superAdmin) {
        CommunicationTemplate template = repository.findById(templateId)
                .orElseThrow(() -> new NotFoundException("Template not found"));

        if (!superAdmin && !Objects.equals(template.getCompanyId(), companyId)) {
            throw new ForbiddenException("Template does not belong to this company");
        }
        repository.delete(template);
    }

    private List<CommunicationTemplate> filterByCategory(List<CommunicationTemplate> templates,
                                                         TemplateCategory category) {
        if (category == null) {
            return templates;
        }
        return templates.stream()
                .filter(template -> template.getCategory() == category)
                .collect(Collectors.toList());
    }

    private TemplateCategory parseCategory(String category) {
        if (category == null || category.isBlank()) {
            throw new BadRequestException("Template category is required");
        }
        return TemplateCategory.valueOf(category.trim().toUpperCase(Locale.ROOT));
    }
}
