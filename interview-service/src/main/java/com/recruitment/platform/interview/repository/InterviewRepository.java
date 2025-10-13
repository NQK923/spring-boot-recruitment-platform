package com.recruitment.platform.interview.repository;

import com.recruitment.platform.interview.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewRepository extends JpaRepository<Interview, Long> { }
