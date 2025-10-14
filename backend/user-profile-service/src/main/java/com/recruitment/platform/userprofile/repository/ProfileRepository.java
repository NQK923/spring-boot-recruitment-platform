package com.recruitment.platform.userprofile.repository;

import com.recruitment.platform.userprofile.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> { }
