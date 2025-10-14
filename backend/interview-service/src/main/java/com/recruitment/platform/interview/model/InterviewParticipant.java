package com.recruitment.platform.interview.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "interview_participants")
public class InterviewParticipant {

    @EmbeddedId
    private InterviewParticipantPK id;

    @ManyToOne
    @MapsId("interviewId")
    @JoinColumn(name = "interview_id")
    private Interview interview;

    @Column(name = "user_id", insertable=false, updatable=false)
    private Long userId;

    private String role; // e.g., INTERVIEWER, CANDIDATE

    // Constructors, Getters, and Setters
    public InterviewParticipant() {}

    public InterviewParticipant(Interview interview, Long userId, String role) {
        this.id = new InterviewParticipantPK();
        this.interview = interview;
        this.userId = userId;
        this.role = role;
        this.id.interviewId = interview.getId();
        this.id.userId = userId;
    }
}
