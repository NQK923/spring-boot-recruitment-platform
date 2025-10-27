package com.recruitment.platform.job.repository;

import com.recruitment.platform.job.dto.CompanyJobStatusAggregation;
import com.recruitment.platform.job.dto.JobStatusAggregation;
import com.recruitment.platform.job.model.JobPosting;
import com.recruitment.platform.job.model.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    Page<JobPosting> findByStatus(JobStatus status, Pageable pageable);
    List<JobPosting> findByCompanyId(Long companyId);

    @Query("""
            SELECT jp FROM JobPosting jp
            WHERE jp.status = :status
              AND (
                    LOWER(jp.title) LIKE :search OR
                    LOWER(COALESCE(jp.location, '')) LIKE :search
                  )
            """)
    Page<JobPosting> searchPublishedJobsByTitleOrLocation(@Param("status") JobStatus status,
                                                          @Param("search") String search,
                                                          Pageable pageable);

    @Query("""
            SELECT new com.recruitment.platform.job.dto.JobStatusAggregation(jp.status, COUNT(jp))
            FROM JobPosting jp
            GROUP BY jp.status
            """)
    List<JobStatusAggregation> aggregateByStatus();

    @Query("""
            SELECT new com.recruitment.platform.job.dto.CompanyJobStatusAggregation(jp.companyId, jp.status, COUNT(jp))
            FROM JobPosting jp
            GROUP BY jp.companyId, jp.status
            """)
    List<CompanyJobStatusAggregation> aggregateByCompanyAndStatus();

    @Query("""
            SELECT new com.recruitment.platform.job.dto.CompanyJobStatusAggregation(jp.companyId, jp.status, COUNT(jp))
            FROM JobPosting jp
            WHERE jp.companyId = :companyId
            GROUP BY jp.companyId, jp.status
            """)
    List<CompanyJobStatusAggregation> aggregateByCompanyAndStatus(@Param("companyId") Long companyId);

    @Query("SELECT jp.id FROM JobPosting jp WHERE jp.companyId = :companyId")
    List<Long> findIdsByCompanyId(@Param("companyId") Long companyId);
}
