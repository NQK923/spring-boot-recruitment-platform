package com.recruitment.platform.interview.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
public class InterviewParticipantPK implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "interview_id")
    private Long interviewId;

    @Column(name = "user_id")
    private Long userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InterviewParticipantPK that = (InterviewParticipantPK) o;
        return Objects.equals(interviewId, that.interviewId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(interviewId, userId);
    }
}
