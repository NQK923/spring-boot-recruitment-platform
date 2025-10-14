package com.recruitment.platform.interview.service;

import com.recruitment.platform.interview.dto.ScheduleRequest;
import com.recruitment.platform.interview.event.InterviewScheduledEvent;
import com.recruitment.platform.interview.model.Interview;
import com.recruitment.platform.interview.model.InterviewParticipant;
import com.recruitment.platform.interview.repository.InterviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Stream;

@Service
public class InterviewService {

    private static final Logger log = LoggerFactory.getLogger(InterviewService.class);
    private final InterviewRepository interviewRepository;
    private final StreamBridge streamBridge;

    public InterviewService(InterviewRepository interviewRepository, StreamBridge streamBridge) {
        this.interviewRepository = interviewRepository;
        this.streamBridge = streamBridge;
    }

    @Transactional
    public Interview scheduleInterview(ScheduleRequest request, Long recruiterId) {
        Interview interview = new Interview();
        interview.setApplicationId(request.applicationId());
        interview.setScheduleTime(request.scheduleTime());
        interview.setTimezone(request.timezone());
        interview.setFormat(request.format());
        interview.setLocationOrLink(request.locationOrLink());

        // Add candidate as participant
        InterviewParticipant candidateParticipant = new InterviewParticipant(interview, request.candidateId(), "CANDIDATE");
        interview.getParticipants().add(candidateParticipant);

        // Add interviewers as participants
        for (Long interviewerId : request.interviewerIds()) {
            InterviewParticipant interviewerParticipant = new InterviewParticipant(interview, interviewerId, "INTERVIEWER");
            interview.getParticipants().add(interviewerParticipant);
        }

        Interview savedInterview = interviewRepository.save(interview);

        // Publish event
        List<Long> allParticipantIds = Stream.concat(
                Stream.of(request.candidateId()),
                request.interviewerIds().stream()
        ).toList();

        var event = new InterviewScheduledEvent(
                savedInterview.getId(),
                savedInterview.getApplicationId(),
                savedInterview.getScheduleTime(),
                savedInterview.getTimezone(),
                savedInterview.getLocationOrLink(),
                allParticipantIds
        );
        streamBridge.send("interviewScheduled-out-0", event);
        log.info("Published InterviewScheduledEvent for interview {}", savedInterview.getId());

        return savedInterview;
    }
}
