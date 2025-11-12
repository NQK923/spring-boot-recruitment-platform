package com.recruitment.platform.job.dto;

import com.recruitment.platform.job.model.JobStatus;

public record JobInternalDetails(
        Long id,
        Long companyId,
        JobStatus status,
        String title,
        String description,
        String location,
        String workType,
        String salaryRange,
        String department
) { }
