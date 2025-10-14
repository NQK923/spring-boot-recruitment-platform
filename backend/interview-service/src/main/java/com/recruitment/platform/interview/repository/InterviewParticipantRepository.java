package com.recruitment.platform.interview.repository;

import com.recruitment.platform.interview.model.InterviewParticipant;
import com.recruitment.platform.interview.model.InterviewParticipantPK;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewParticipantRepository extends JpaRepository<InterviewParticipant, InterviewParticipantPK> {
}
