package com.recruitment.platform.company.service;

import com.recruitment.platform.company.client.ApplicationMetricsClient;
import com.recruitment.platform.company.client.InterviewMetricsClient;
import com.recruitment.platform.company.client.JobMetricsClient;
import com.recruitment.platform.company.client.JobPublicClient;
import com.recruitment.platform.company.client.ProfileMetricsClient;
import com.recruitment.platform.company.dto.PublicOverviewResponse;
import com.recruitment.platform.company.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class PublicOverviewService {

    private static final List<String> APPLICATION_STAGE_ORDER = List.of(
            "APPLIED",
            "SCREENING",
            "INTERVIEWING",
            "OFFERED",
            "HIRED",
            "REJECTED"
    );

    private final CompanyRepository companyRepository;
    private final JobMetricsClient jobMetricsClient;
    private final ApplicationMetricsClient applicationMetricsClient;
    private final ProfileMetricsClient profileMetricsClient;
    private final InterviewMetricsClient interviewMetricsClient;
    private final JobPublicClient jobPublicClient;

    public PublicOverviewService(CompanyRepository companyRepository,
                                 JobMetricsClient jobMetricsClient,
                                 ApplicationMetricsClient applicationMetricsClient,
                                 ProfileMetricsClient profileMetricsClient,
                                 InterviewMetricsClient interviewMetricsClient,
                                 JobPublicClient jobPublicClient) {
        this.companyRepository = companyRepository;
        this.jobMetricsClient = jobMetricsClient;
        this.applicationMetricsClient = applicationMetricsClient;
        this.profileMetricsClient = profileMetricsClient;
        this.interviewMetricsClient = interviewMetricsClient;
        this.jobPublicClient = jobPublicClient;
    }

    @Transactional(readOnly = true)
    public PublicOverviewResponse getOverview() {
        long totalCompanies = companyRepository.count();

        JobMetricsClient.JobMetricsSummary jobSummary = jobMetricsClient.getSummary();
        ApplicationMetricsClient.MetricsResponse applicationSummary = applicationMetricsClient.getSummary();
        ProfileMetricsClient.ProfileMetrics profileSummary = profileMetricsClient.getSummary();
        InterviewMetricsClient.InterviewMetrics interviewSummary = interviewMetricsClient.getSummary();

        Map<String, Long> applicationByStatus = applicationSummary.applicationsByStatus() != null
                ? applicationSummary.applicationsByStatus()
                : Map.of();
        List<PublicOverviewResponse.PipelineStage> applicationStages = APPLICATION_STAGE_ORDER.stream()
                .map(stage -> new PublicOverviewResponse.PipelineStage(stage, getCount(applicationByStatus, stage)))
                .toList();

        Map<String, Long> jobsByStatus = jobSummary.jobsByStatus() != null
                ? jobSummary.jobsByStatus()
                : Map.of();

        List<PublicOverviewResponse.JobStatusBreakdown> jobStatusBreakdown = jobsByStatus.entrySet().stream()
                .map(entry -> new PublicOverviewResponse.JobStatusBreakdown(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(PublicOverviewResponse.JobStatusBreakdown::status))
                .toList();

        List<PublicOverviewResponse.JobSpotlight> spotlightJobs = jobPublicClient.listPublicJobs().stream()
                .filter(job -> job.status() == null || "PUBLISHED".equalsIgnoreCase(job.status()))
                .sorted(Comparator.comparing(JobPublicClient.JobPostingPublic::id).reversed())
                .limit(4)
                .map(job -> new PublicOverviewResponse.JobSpotlight(
                        job.id(),
                        job.companyId(),
                        job.title(),
                        truncate(job.description()),
                        job.location(),
                        job.workType(),
                        job.department(),
                        job.level(),
                        job.status()
                ))
                .toList();

        PublicOverviewResponse.Metrics metrics = new PublicOverviewResponse.Metrics(
                totalCompanies,
                profileSummary.totalProfiles(),
                jobSummary.totalJobs(),
                applicationSummary.totalApplications(),
                interviewSummary.totalInterviews(),
                interviewSummary.upcomingInterviews()
        );

        PublicOverviewResponse.Pipeline pipeline = new PublicOverviewResponse.Pipeline(applicationStages, jobStatusBreakdown);
        return new PublicOverviewResponse(metrics, pipeline, spotlightJobs);
    }

    private long getCount(Map<String, Long> data, String key) {
        if (data == null || key == null) {
            return 0;
        }
        return data.getOrDefault(key, 0L);
    }

    private String truncate(String description) {
        if (description == null) {
            return null;
        }
        final int maxLength = 220;
        String trimmed = description.trim();
        if (trimmed.length() <= maxLength) {
            return trimmed;
        }
        return trimmed.substring(0, maxLength).stripTrailing() + "...";
    }
}
