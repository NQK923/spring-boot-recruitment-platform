package com.recruitment.platform.job.repository;

import com.recruitment.platform.job.dto.CompanyJobStatusAggregation;
import com.recruitment.platform.job.dto.JobStatusAggregation;
import com.recruitment.platform.job.model.JobPosting;
import com.recruitment.platform.job.model.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByStatus(JobStatus status);
    List<JobPosting> findByCompanyId(Long companyId);

    @Query("""
            SELECT jp FROM JobPosting jp
            LEFT JOIN jp.jobPosition pos
            WHERE jp.status = :status
              AND (
                    LOWER(jp.title) LIKE :search OR
                    LOWER(COALESCE(jp.description, '')) LIKE :search OR
                    LOWER(COALESCE(jp.location, '')) LIKE :search OR
                    LOWER(COALESCE(jp.workType, '')) LIKE :search OR
                    LOWER(COALESCE(pos.department, '')) LIKE :search OR
                    LOWER(COALESCE(pos.level, '')) LIKE :search
                  )
            """)
    List<JobPosting> searchPublishedJobs(@Param("status") JobStatus status, @Param("search") String search);

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
