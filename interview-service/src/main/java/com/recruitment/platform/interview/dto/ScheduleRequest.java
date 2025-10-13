package com.recruitment.platform.interview.dto;

import java.time.Instant;

public record ScheduleRequest(Long applicationId, Instant scheduledTime) { }
