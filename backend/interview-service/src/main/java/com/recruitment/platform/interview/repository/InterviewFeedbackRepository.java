package com.recruitment.platform.interview.repository;

import com.recruitment.platform.interview.model.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {
    Optional<InterviewFeedback> findByInterview_IdAndInterviewerId(Long interviewId, Long interviewerId);
}
