package com.recruitment.platform.company.dto;

import java.util.List;

public record PublicOverviewResponse(
        Metrics metrics,
        Pipeline pipeline,
        List<JobSpotlight> spotlightJobs
) {
    public record Metrics(
            long companies,
            long candidates,
            long jobs,
            long applications,
            long interviews,
            long upcomingInterviews
    ) {}

    public record Pipeline(
            List<PipelineStage> applicationStages,
            List<JobStatusBreakdown> jobStatuses
    ) {}

    public record PipelineStage(String stage, long count) {}

    public record JobStatusBreakdown(String status, long count) {}

    public record JobSpotlight(
            Long id,
            Long companyId,
            String title,
            String description,
            String requirements,
            String benefits,
            String location,
            String workType,
            String department,
            String level,
            String status
    ) {}
}
