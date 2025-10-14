package com.recruitment.platform.interview.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class InterviewParticipantPK implements Serializable {
    private Long interviewId;
    private Long userId;

    // equals and hashCode
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
