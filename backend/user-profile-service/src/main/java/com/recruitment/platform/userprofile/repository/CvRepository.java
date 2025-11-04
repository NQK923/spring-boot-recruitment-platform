package com.recruitment.platform.userprofile.repository;

import com.recruitment.platform.userprofile.model.Cv;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CvRepository extends JpaRepository<Cv, Long> {
    List<Cv> findByProfile_UserId(Long userId);
    Optional<Cv> findByIdAndProfile_UserId(Long id, Long userId);
}
