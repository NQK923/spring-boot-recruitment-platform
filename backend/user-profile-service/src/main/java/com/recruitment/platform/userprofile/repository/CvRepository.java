package com.recruitment.platform.userprofile.repository;

import com.recruitment.platform.userprofile.model.Cv;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CvRepository extends JpaRepository<Cv, Long> {
}
