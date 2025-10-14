package com.recruitment.platform.interview.dto;

import java.time.Instant;
import java.util.List;

public record ScheduleRequest(
    Long applicationId,
    Instant scheduleTime,
    String timezone,
    String format,
    String locationOrLink,
    List<Long> interviewerIds,
    Long candidateId // Need to know the candidate to add them as a participant
) { }
