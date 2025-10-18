package com.recruitment.platform.notification.service;

import com.recruitment.platform.notification.client.AuthServiceClient;
import com.recruitment.platform.notification.event.ApplicationStatusChangedEvent;
import com.recruitment.platform.notification.event.InterviewRescheduledEvent;
import com.recruitment.platform.notification.event.InterviewScheduledEvent;
import com.recruitment.platform.notification.event.UserInvitedEvent;
import com.recruitment.platform.notification.event.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);
    private final JavaMailSender mailSender;
    private final AuthServiceClient authServiceClient;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public NotificationEventListener(JavaMailSender mailSender, AuthServiceClient authServiceClient) {
        this.mailSender = mailSender;
        this.authServiceClient = authServiceClient;
    }

    @Bean
    public Consumer<UserInvitedEvent> userInvitedEventConsumer() {
        return event -> {
            log.info("Received UserInvitedEvent for email: {}", event.email());
            String subject = "You have been invited to the Recruitment Platform";
            String invitationUrl = "http://localhost:3000/accept-invite?token=" + event.token(); // Frontend URL
            String text = String.format("Hello!\n\nYou have been invited to join as a %s. Please click the link below to accept:\n%s", event.roleToGrant(), invitationUrl);
            sendEmail(event.email(), subject, text);
        };
    }

    @Bean
    public Consumer<UserRegisteredEvent> userRegisteredEventConsumer() {
        return event -> {
            log.info("Received UserRegisteredEvent for email: {}", event.email());
            String subject = "Welcome to the Recruitment Platform!";
            String text;
            if (event.verificationToken() != null) {
                String verificationUrl = "http://localhost:3000/verify-email?token=" + event.verificationToken();
                text = String.format(
                        "Hello!%n%nThank you for registering. Please verify your email by clicking the link below:%n%s%n%nIf you didn't create an account, please ignore this email.",
                        verificationUrl
                );
            } else {
                text = "Hello!\n\nThank you for registering. We are excited to have you on board.";
            }
            sendEmail(event.email(), subject, text);
        };
    }

    @Bean
    public Consumer<ApplicationStatusChangedEvent> applicationStatusChangedEventConsumer() {
        return event -> {
            log.info("Received ApplicationStatusChangedEvent for application ID: {}", event.applicationId());
            
            // Fetch the candidate's email
            List<AuthServiceClient.UserEmailInfo> users = authServiceClient.getUsersByIds(new AuthServiceClient.BatchUserIdsRequest(List.of(event.candidateId())));
            if (users.isEmpty()) {
                log.error("Could not find user with ID: {}", event.candidateId());
                return;
            }
            String candidateEmail = users.get(0).email();

            String subject = String.format("Update on your application for Job #%d", event.jobPostingId());
            String text = String.format("Hello!\n\nThe status of your application for job #%d has been updated to: %s", event.jobPostingId(), event.newStatus());
            sendEmail(candidateEmail, subject, text);
        };
    }

    @Bean
    public Consumer<InterviewScheduledEvent> interviewScheduledEventConsumer() {
        return event -> {
            log.info("Received InterviewScheduledEvent for interview ID: {}", event.interviewId());

            // Fetch emails for all participants
            List<AuthServiceClient.UserEmailInfo> users = authServiceClient.getUsersByIds(new AuthServiceClient.BatchUserIdsRequest(event.participantUserIds()));
            Map<Long, String> userIdToEmailMap = users.stream().collect(Collectors.toMap(AuthServiceClient.UserEmailInfo::id, AuthServiceClient.UserEmailInfo::email));

            String subject = "An interview has been scheduled";
            String text = String.format("Hello!\n\nAn interview for your application #%d has been scheduled for %s at %s.\n\nLocation/Link: %s",
                    event.applicationId(), event.scheduleTime(), event.timezone(), event.locationOrLink());

            event.participantUserIds().forEach(userId -> {
                String participantEmail = userIdToEmailMap.get(userId);
                if (participantEmail != null) {
                    sendEmail(participantEmail, subject, text);
                } else {
                    log.warn("Could not find email for participant with ID: {}", userId);
                }
            });
        };
    }

    @Bean
    public Consumer<InterviewRescheduledEvent> interviewRescheduledEventConsumer() {
        return event -> {
            log.info("Received InterviewRescheduledEvent for interview ID: {}", event.interviewId());

            List<AuthServiceClient.UserEmailInfo> users = authServiceClient.getUsersByIds(new AuthServiceClient.BatchUserIdsRequest(event.participantUserIds()));
            Map<Long, String> userIdToEmailMap = users.stream().collect(Collectors.toMap(AuthServiceClient.UserEmailInfo::id, AuthServiceClient.UserEmailInfo::email));

            String subject = "Interview schedule updated";
            String text = String.format("Hello!\n\nYour interview for application #%d has been rescheduled for %s (%s).\n\nUpdated Location/Link: %s",
                    event.applicationId(), event.newScheduleTime(), event.timezone(), event.locationOrLink());

            event.participantUserIds().forEach(userId -> {
                String participantEmail = userIdToEmailMap.get(userId);
                if (participantEmail != null) {
                    sendEmail(participantEmail, subject, text);
                } else {
                    log.warn("Could not find email for participant with ID: {}", userId);
                }
            });
        };
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Successfully sent email to {}", to);
        } catch (Exception e) {
            log.error("Error sending email to {}: {}", to, e.getMessage());
        }
    }
}
