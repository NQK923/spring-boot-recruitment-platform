package com.recruitment.platform.interview.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews")
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long applicationId;
    private Instant scheduleTime;
    private String timezone;
    private String format; // e.g., ONLINE, OFFLINE
    private String locationOrLink;

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InterviewParticipant> participants = new ArrayList<>();

    // Getters & Setters
    public Long getId() { return id; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public void setScheduleTime(Instant scheduleTime) { this.scheduleTime = scheduleTime; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    public void setFormat(String format) { this.format = format; }
    public void setLocationOrLink(String locationOrLink) { this.locationOrLink = locationOrLink; }
    public List<InterviewParticipant> getParticipants() { return participants; }
    public void setParticipants(List<InterviewParticipant> participants) { this.participants = participants; }
}
