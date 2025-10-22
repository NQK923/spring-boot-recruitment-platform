package com.recruitment.platform.job.service;

import com.recruitment.platform.job.dto.CompanyJobMetricsResponse;
import com.recruitment.platform.job.dto.CompanyJobStatusAggregation;
import com.recruitment.platform.job.dto.JobMetricsSummaryResponse;
import com.recruitment.platform.job.dto.JobOpenRoleSummary;
import com.recruitment.platform.job.dto.JobStatusAggregation;
import com.recruitment.platform.job.model.JobStatus;
import com.recruitment.platform.job.repository.JobPostingRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class JobMetricsService {

    private final JobPostingRepository jobPostingRepository;

    public JobMetricsService(JobPostingRepository jobPostingRepository) {
        this.jobPostingRepository = jobPostingRepository;
    }

    public JobMetricsSummaryResponse getSummary() {
        List<JobStatusAggregation> totals = jobPostingRepository.aggregateByStatus();
        Map<String, Long> byStatus = toStatusMap(totals);
        long totalJobs = totals.stream().mapToLong(JobStatusAggregation::count).sum();

        List<JobOpenRoleSummary> topCompanies = jobPostingRepository.aggregateByCompanyAndStatus()
                .stream()
                .filter(agg -> agg.status() == JobStatus.PUBLISHED)
                .map(agg -> new JobOpenRoleSummary(agg.companyId(), agg.count()))
                .collect(Collectors.groupingBy(JobOpenRoleSummary::companyId,
                        Collectors.summingLong(JobOpenRoleSummary::openRoles)))
                .entrySet()
                .stream()
                .map(entry -> new JobOpenRoleSummary(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparingLong(JobOpenRoleSummary::openRoles).reversed())
                .limit(5)
                .toList();

        return new JobMetricsSummaryResponse(totalJobs, byStatus, topCompanies);
    }

    public CompanyJobMetricsResponse getCompanyMetrics(Long companyId) {
        List<CompanyJobStatusAggregation> aggregations =
                jobPostingRepository.aggregateByCompanyAndStatus(companyId);

        Map<String, Long> byStatus = toCompanyStatusMap(aggregations);
        long total = aggregations.stream().mapToLong(CompanyJobStatusAggregation::count).sum();
        return new CompanyJobMetricsResponse(companyId, total, byStatus);
    }

    public List<Long> getJobIdsForCompany(Long companyId) {
        return jobPostingRepository.findIdsByCompanyId(companyId);
    }

    private Map<String, Long> toStatusMap(List<? extends JobStatusAggregation> aggregations) {
        Map<JobStatus, Long> map = new EnumMap<>(JobStatus.class);
        aggregations.forEach(agg -> map.merge(agg.status(), agg.count(), Long::sum));
        return map.entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> entry.getKey().name().toLowerCase(Locale.ROOT),
                        Map.Entry::getValue,
                        (left, right) -> right,
                        java.util.LinkedHashMap::new));
    }

    private Map<String, Long> toCompanyStatusMap(List<CompanyJobStatusAggregation> aggregations) {
        Map<JobStatus, Long> map = new EnumMap<>(JobStatus.class);
        aggregations.forEach(agg -> map.merge(agg.status(), agg.count(), Long::sum));
        return map.entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> entry.getKey().name().toLowerCase(Locale.ROOT),
                        Map.Entry::getValue,
                        (left, right) -> right,
                        java.util.LinkedHashMap::new));
    }
}
