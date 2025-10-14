package com.recruitment.platform.application.repository;

import com.recruitment.platform.application.model.ApplicationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationHistoryRepository extends JpaRepository<ApplicationHistory, Long> {
}
