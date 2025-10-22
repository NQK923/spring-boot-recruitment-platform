package com.recruitment.platform.application.repository;

import com.recruitment.platform.application.model.ApplicationTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationTaskRepository extends JpaRepository<ApplicationTask, Long> {
    List<ApplicationTask> findByApplicationIdOrderByDueDateAscCreatedAtAsc(Long applicationId);
}

