package com.recruitment.platform.interview.service;

import com.recruitment.platform.interview.dto.InterviewMetricsResponse;
import com.recruitment.platform.interview.repository.InterviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class InterviewMetricsService {

    private final InterviewRepository interviewRepository;

    public InterviewMetricsService(InterviewRepository interviewRepository) {
        this.interviewRepository = interviewRepository;
    }

    @Transactional(readOnly = true)
    public InterviewMetricsResponse getSummary() {
        long totalInterviews = interviewRepository.count();
        long upcomingInterviews = interviewRepository.countByScheduleTimeAfter(Instant.now());
        return new InterviewMetricsResponse(totalInterviews, upcomingInterviews);
    }
}
