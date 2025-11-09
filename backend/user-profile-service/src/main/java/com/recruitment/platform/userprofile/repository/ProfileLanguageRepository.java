package com.recruitment.platform.userprofile.repository;

import com.recruitment.platform.userprofile.model.ProfileLanguage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfileLanguageRepository extends JpaRepository<ProfileLanguage, Long> {

    List<ProfileLanguage> findByProfile_UserId(Long userId);

    Optional<ProfileLanguage> findByIdAndProfile_UserId(Long id, Long userId);
}
