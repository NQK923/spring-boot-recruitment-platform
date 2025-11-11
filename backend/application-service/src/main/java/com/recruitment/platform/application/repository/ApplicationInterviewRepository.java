package com.recruitment.platform.application.repository;

import com.recruitment.platform.application.model.ApplicationInterview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicationInterviewRepository extends JpaRepository<ApplicationInterview, Long> {
    Optional<ApplicationInterview> findByApplicationId(Long applicationId);
}
