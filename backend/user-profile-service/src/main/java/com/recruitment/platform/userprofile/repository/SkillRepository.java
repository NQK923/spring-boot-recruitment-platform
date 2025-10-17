package com.recruitment.platform.userprofile.repository;

import com.recruitment.platform.userprofile.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {
}
