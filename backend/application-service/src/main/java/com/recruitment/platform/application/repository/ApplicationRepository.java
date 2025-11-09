package com.recruitment.platform.application.repository;

import com.recruitment.platform.application.dto.ApplicationStatusAggregation;
import com.recruitment.platform.application.model.Application;
import com.recruitment.platform.application.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByJobPostingId(Long jobPostingId);
    boolean existsByCandidateIdAndJobPostingId(Long candidateId, Long jobPostingId);
    long countByJobPostingIdAndStatus(Long jobPostingId, ApplicationStatus status);

    @Query("""
            SELECT new com.recruitment.platform.application.dto.ApplicationStatusAggregation(a.status, COUNT(a))
            FROM Application a
            GROUP BY a.status
            """)
    List<ApplicationStatusAggregation> aggregateByStatus();

    @Query("""
            SELECT new com.recruitment.platform.application.dto.ApplicationStatusAggregation(a.status, COUNT(a))
            FROM Application a
            WHERE a.jobPostingId IN :jobPostingIds
            GROUP BY a.status
            """)
    List<ApplicationStatusAggregation> aggregateByStatusForJobIds(@Param("jobPostingIds") List<Long> jobPostingIds);
}
