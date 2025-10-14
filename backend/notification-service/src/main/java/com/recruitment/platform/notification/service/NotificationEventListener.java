package com.recruitment.platform.notification.service;

import com.recruitment.platform.notification.event.ApplicationStatusChangedEvent;
import com.recruitment.platform.notification.event.InterviewScheduledEvent;
import com.recruitment.platform.notification.event.UserInvitedEvent;
import com.recruitment.platform.notification.event.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.function.Consumer;

@Service
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);
    private final JavaMailSender mailSender;

    public NotificationEventListener(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Bean
    public Consumer<UserInvitedEvent> userInvitedEventConsumer() {
        return event -> {
            log.info("Received UserInvitedEvent for email: {}", event.email());
            // Simulate sending email
            log.info("Simulating sending invitation email to {}", event.email());
        };
    }

    @Bean
    public Consumer<UserRegisteredEvent> userRegisteredEventConsumer() {
        return event -> {
            log.info("Received UserRegisteredEvent for email: {}", event.email());
            // Simulate sending welcome/verification email
            log.info("Simulating sending welcome email to {}", event.email());
        };
    }

    @Bean
    public Consumer<ApplicationStatusChangedEvent> applicationStatusChangedEventConsumer() {
        return event -> {
            log.info("Received ApplicationStatusChangedEvent for application ID: {}", event.applicationId());
            // In a real app, you would look up the candidate's email from their ID
            log.info("Simulating sending status update email for application {} to candidate {}", event.applicationId(), event.candidateId());
        };
    }

    @Bean
    public Consumer<InterviewScheduledEvent> interviewScheduledEventConsumer() {
        return event -> {
            log.info("Received InterviewScheduledEvent for interview ID: {}", event.interviewId());
            // In a real app, you would look up emails for all participant IDs
            log.info("Simulating sending interview schedule notification to participants: {}", event.participantUserIds());
        };
    }
}
