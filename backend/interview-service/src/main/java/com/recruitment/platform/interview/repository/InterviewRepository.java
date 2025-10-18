package com.recruitment.platform.interview.repository;

import com.recruitment.platform.interview.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    @Query("select distinct i from Interview i join i.participants p where p.id.userId = :userId")
    List<Interview> findAllByParticipantUserId(@Param("userId") Long userId);
}
