package com.recruitment.platform.interview.service;

import com.recruitment.platform.interview.dto.FeedbackRequest;
import com.recruitment.platform.interview.dto.InterviewFeedbackResponse;
import com.recruitment.platform.interview.dto.InterviewParticipantResponse;
import com.recruitment.platform.interview.dto.InterviewResponse;
import com.recruitment.platform.interview.dto.ScheduleRequest;
import com.recruitment.platform.interview.dto.UpdateInterviewRequest;
import com.recruitment.platform.interview.event.InterviewRescheduledEvent;
import com.recruitment.platform.interview.event.InterviewScheduledEvent;
import com.recruitment.platform.interview.model.Interview;
import com.recruitment.platform.interview.model.InterviewParticipant;
import com.recruitment.platform.interview.model.InterviewFeedback;
import com.recruitment.platform.interview.repository.InterviewRepository;
import com.recruitment.platform.interview.repository.InterviewFeedbackRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class InterviewService {

    private static final Logger log = LoggerFactory.getLogger(InterviewService.class);
    private static final DateTimeFormatter ICS_FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);
    private static final Duration DEFAULT_INTERVIEW_DURATION = Duration.ofHours(1);

    private final InterviewRepository interviewRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final StreamBridge streamBridge;

    public InterviewService(InterviewRepository interviewRepository,
                             InterviewFeedbackRepository feedbackRepository,
                             StreamBridge streamBridge) {
        this.interviewRepository = interviewRepository;
        this.feedbackRepository = feedbackRepository;
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

    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsForUser(Long userId) {
        List<Interview> interviews = interviewRepository.findAllByParticipantUserId(userId);
        return interviews.stream()
                .map(interview -> {
                    List<InterviewParticipantResponse> participants = interview.getParticipants().stream()
                            .map(participant -> new InterviewParticipantResponse(participant.getUserId(), participant.getRole()))
                            .toList();

                    List<InterviewFeedbackResponse> feedback = interview.getFeedback().stream()
                            .map(item -> new InterviewFeedbackResponse(
                                    item.getInterviewerId(),
                                    Integer.valueOf(item.getScore()),
                                    item.getComments(),
                                    item.getOutcome()
                            ))
                            .toList();

                    return new InterviewResponse(
                            interview.getId(),
                            interview.getApplicationId(),
                            interview.getScheduleTime(),
                            interview.getTimezone(),
                            interview.getFormat(),
                            interview.getLocationOrLink(),
                            participants,
                            feedback,
                            interview.getOutcome()
                    );
                })
                .toList();
    }

    @Transactional
    public Interview rescheduleInterview(Long interviewId, UpdateInterviewRequest request) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        if (request.scheduleTime() != null) {
            interview.setScheduleTime(request.scheduleTime());
        }
        if (request.timezone() != null) {
            interview.setTimezone(request.timezone());
        }
        if (request.format() != null) {
            interview.setFormat(request.format());
        }
        if (request.locationOrLink() != null) {
            interview.setLocationOrLink(request.locationOrLink());
        }

        Interview savedInterview = interviewRepository.save(interview);

        List<Long> participantIds = savedInterview.getParticipants().stream()
                .map(InterviewParticipant::getUserId)
                .toList();

        var event = new InterviewRescheduledEvent(
                savedInterview.getId(),
                savedInterview.getApplicationId(),
                savedInterview.getScheduleTime(),
                savedInterview.getTimezone(),
                savedInterview.getLocationOrLink(),
                participantIds
        );
        streamBridge.send("interviewRescheduled-out-0", event);
        log.info("Published InterviewRescheduledEvent for interview {}", savedInterview.getId());

        return savedInterview;
    }

    @Transactional
    public InterviewFeedback recordFeedback(Long interviewId, Long interviewerId, FeedbackRequest request) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        InterviewFeedback feedback = feedbackRepository.findByInterview_IdAndInterviewerId(interviewId, interviewerId)
                .orElseGet(() -> {
                    InterviewFeedback newFeedback = new InterviewFeedback();
                    newFeedback.setInterview(interview);
                    newFeedback.setInterviewerId(interviewerId);
                    return newFeedback;
                });

        if (request.score() != null) {
            feedback.setScore(request.score());
        }
        feedback.setOutcome(request.outcome());
        feedback.setComments(request.comments());

        return feedbackRepository.save(feedback);
    }

    @Transactional(readOnly = true)
    public String generateInterviewCalendar(Long interviewId, Long requesterUserId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        boolean isParticipant = interview.getParticipants().stream()
                .anyMatch(participant -> participant.getUserId().equals(requesterUserId));
        if (!isParticipant) {
            throw new AccessDeniedException("User does not have access to this interview calendar");
        }
        return buildCalendarFeed(List.of(interview));
    }

    @Transactional(readOnly = true)
    public String generateCalendarForUser(Long userId) {
        List<Interview> interviews = interviewRepository.findAllByParticipantUserId(userId);
        return buildCalendarFeed(interviews);
    }

    private String buildCalendarFeed(List<Interview> interviews) {
        StringBuilder builder = new StringBuilder();
        builder.append("BEGIN:VCALENDAR\r\n")
                .append("VERSION:2.0\r\n")
                .append("PRODID:-//Recruitment Platform//Interview Calendar//EN\r\n")
                .append("CALSCALE:GREGORIAN\r\n")
                .append("METHOD:PUBLISH\r\n");

        for (Interview interview : interviews) {
            appendEvent(builder, interview);
        }

        builder.append("END:VCALENDAR\r\n");
        return builder.toString();
    }

    private void appendEvent(StringBuilder builder, Interview interview) {
        if (interview.getScheduleTime() == null) {
            return;
        }
        ZoneId zoneId = resolveZoneId(interview.getTimezone());
        ZonedDateTime start = interview.getScheduleTime().atZone(zoneId);
        ZonedDateTime end = start.plus(DEFAULT_INTERVIEW_DURATION);

        String participants = interview.getParticipants().stream()
                .map(participant -> participant.getRole() + " #" + participant.getUserId())
                .collect(Collectors.joining(", "));

        StringBuilder descriptionBuilder = new StringBuilder();
        if (interview.getFormat() != null) {
            descriptionBuilder.append("Format: ").append(interview.getFormat());
        }
        if (interview.getTimezone() != null) {
            if (!descriptionBuilder.isEmpty()) {
                descriptionBuilder.append("\\n");
            }
            descriptionBuilder.append("Timezone: ").append(interview.getTimezone());
        }
        if (!participants.isEmpty()) {
            if (!descriptionBuilder.isEmpty()) {
                descriptionBuilder.append("\\n");
            }
            descriptionBuilder.append("Participants: ").append(participants);
        }

        builder.append("BEGIN:VEVENT\r\n")
                .append("UID:interview-").append(interview.getId()).append("@recruitment-platform\r\n")
                .append("DTSTAMP:").append(ICS_FORMATTER.format(ZonedDateTime.now(ZoneOffset.UTC))).append("\r\n")
                .append("DTSTART:").append(ICS_FORMATTER.format(start.withZoneSameInstant(ZoneOffset.UTC))).append("\r\n")
                .append("DTEND:").append(ICS_FORMATTER.format(end.withZoneSameInstant(ZoneOffset.UTC))).append("\r\n")
                .append("SUMMARY:Interview - Application ").append(interview.getApplicationId()).append("\r\n");

        if (!descriptionBuilder.isEmpty()) {
            builder.append("DESCRIPTION:").append(escape(descriptionBuilder.toString())).append("\r\n");
        }
        if (interview.getLocationOrLink() != null && !interview.getLocationOrLink().isBlank()) {
            builder.append("LOCATION:").append(escape(interview.getLocationOrLink())).append("\r\n");
        }
        builder.append("END:VEVENT\r\n");
    }

    private ZoneId resolveZoneId(String timezone) {
        if (timezone == null || timezone.isBlank()) {
            return ZoneOffset.UTC;
        }
        try {
            return ZoneId.of(timezone);
        } catch (Exception ex) {
            log.warn("Unsupported timezone {} for interview calendar, falling back to UTC", timezone);
            return ZoneOffset.UTC;
        }
    }

    private String escape(String value) {
        return value.replace("\\", "\\\\")
                .replace("\n", "\\n")
                .replace("\r", "")
                .replace(",", "\\,")
                .replace(";", "\\;");
    }
}
