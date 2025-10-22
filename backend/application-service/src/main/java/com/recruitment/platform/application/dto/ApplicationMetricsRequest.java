package com.recruitment.platform.application.dto;

import java.util.List;

public record ApplicationMetricsRequest(List<Long> jobPostingIds) {
}
