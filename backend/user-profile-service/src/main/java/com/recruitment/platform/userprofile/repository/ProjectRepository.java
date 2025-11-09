package com.recruitment.platform.userprofile.repository;

import com.recruitment.platform.userprofile.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByProfile_UserId(Long userId);

    Optional<Project> findByIdAndProfile_UserId(Long id, Long userId);
}
