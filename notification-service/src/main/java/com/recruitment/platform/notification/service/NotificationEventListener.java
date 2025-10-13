package com.recruitment.platform.notification.service;

import com.recruitment.platform.notification.event.UserInvitedEvent;
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

            // Construct and send the email
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(event.email());
            message.setSubject("You have been invited to join the Recruitment Platform");
            // In a real app, use a URL from config
            String invitationUrl = "http://localhost:3000/accept-invite?token=" + event.token();
            message.setText("Hello!\n\nYou have been invited to join as a " + event.roleToGrant() + ". Please click the link below to accept:\n" + invitationUrl);
            
            try {
                // mailSender.send(message);
                log.info("Simulated sending email to {}", event.email());
            } catch (Exception e) {
                log.error("Error sending email: {}", e.getMessage());
            }
        };
    }
}
