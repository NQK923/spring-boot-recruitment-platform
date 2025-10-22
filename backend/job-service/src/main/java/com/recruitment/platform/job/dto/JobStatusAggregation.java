package com.recruitment.platform.job.dto;

import com.recruitment.platform.job.model.JobStatus;

public record JobStatusAggregation(JobStatus status, long count) {
}
