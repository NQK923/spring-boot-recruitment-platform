package com.recruitment.platform.job.dto;

import com.recruitment.platform.job.model.JobStatus;

public record CompanyJobStatusAggregation(Long companyId, JobStatus status, long count) {
}
