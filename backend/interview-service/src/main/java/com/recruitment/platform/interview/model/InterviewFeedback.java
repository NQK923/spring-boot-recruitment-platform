package com.recruitment.platform.interview.model;

import jakarta.persistence.*;

@Entity
@Table(name = "interview_feedback")
public class InterviewFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id")
    private Interview interview;

    private Long interviewerId;

    private int score;

    @Lob
    private String comments;

    private String outcome;

    // Getters & Setters
}
