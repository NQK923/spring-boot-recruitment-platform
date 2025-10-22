package com.recruitment.platform.company.repository;

import com.recruitment.platform.company.model.CommunicationTemplate;
import com.recruitment.platform.company.model.TemplateCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommunicationTemplateRepository extends JpaRepository<CommunicationTemplate, Long> {

    List<CommunicationTemplate> findByCompanyId(Long companyId);

    List<CommunicationTemplate> findByCompanyIdIsNull();

    List<CommunicationTemplate> findByCompanyIdAndSharedWithRecruitersTrue(Long companyId);

    List<CommunicationTemplate> findByCompanyIdIsNullAndSharedWithRecruitersTrue();

    @Query("""
            SELECT ct FROM CommunicationTemplate ct
            WHERE ct.companyId = :companyId
              AND (:category IS NULL OR ct.category = :category)
            """)
    List<CommunicationTemplate> findByCompanyIdAndCategory(@Param("companyId") Long companyId,
                                                           @Param("category") TemplateCategory category);

    @Query("""
            SELECT ct FROM CommunicationTemplate ct
            WHERE ct.companyId IS NULL
              AND (:category IS NULL OR ct.category = :category)
            """)
    List<CommunicationTemplate> findGlobalByCategory(@Param("category") TemplateCategory category);
}
