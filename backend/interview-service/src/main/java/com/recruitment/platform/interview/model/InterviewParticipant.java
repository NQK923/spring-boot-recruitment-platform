package com.recruitment.platform.interview.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "interview_participants")
public class InterviewParticipant {

    @EmbeddedId
    private InterviewParticipantPK id = new InterviewParticipantPK();

    @ManyToOne
    @MapsId("interviewId")
    @JoinColumn(name = "interview_id")
    private Interview interview;

    private String role; // e.g., INTERVIEWER, CANDIDATE

    public InterviewParticipant() {
        // Default constructor required by JPA
    }

    public InterviewParticipant(Interview interview, Long userId, String role) {
        this.interview = interview;
        this.role = role;
        this.id.setInterviewId(interview != null ? interview.getId() : null);
        setUserId(userId);
    }

    public Long getUserId() {
        return id != null ? id.getUserId() : null;
    }

    public void setUserId(Long userId) {
        if (this.id == null) {
            this.id = new InterviewParticipantPK();
        }
        this.id.setUserId(userId);
    }
}
