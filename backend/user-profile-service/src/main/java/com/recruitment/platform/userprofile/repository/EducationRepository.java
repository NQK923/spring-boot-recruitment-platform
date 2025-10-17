package com.recruitment.platform.userprofile.repository;

import com.recruitment.platform.userprofile.model.Education;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EducationRepository extends JpaRepository<Education, Long> {
}
