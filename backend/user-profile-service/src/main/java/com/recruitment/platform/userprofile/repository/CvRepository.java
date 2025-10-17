package com.recruitment.platform.userprofile.repository;

import com.recruitment.platform.userprofile.model.Cv;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CvRepository extends JpaRepository<Cv, Long> {
    List<Cv> findByProfile_UserId(Long userId);
}
