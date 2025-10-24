package com.recruitment.platform.notification.config;

import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Normalises the SMTP password and proactively validates the SMTP connection so that
 * startup surfaces any authentication or connectivity issues early.
 */
@Configuration
public class MailSenderConfiguration {

    private static final Logger log = LoggerFactory.getLogger(MailSenderConfiguration.class);

    private final JavaMailSender mailSender;
    private final String rawPassword;

    public MailSenderConfiguration(JavaMailSender mailSender,
                                   @Value("${spring.mail.password:}") String rawPassword) {
        this.mailSender = mailSender;
        this.rawPassword = rawPassword;
    }

    @PostConstruct
    void initialiseMailSender() {
        if (!(mailSender instanceof JavaMailSenderImpl sender)) {
            log.warn("Configured JavaMailSender is not an instance of JavaMailSenderImpl; SMTP diagnostics disabled.");
            return;
        }

        applySanitisedPassword(sender);
        verifySmtpConnectivity(sender);
    }

    private void applySanitisedPassword(JavaMailSenderImpl sender) {
        if (rawPassword == null || rawPassword.isBlank()) {
            log.warn("spring.mail.password is blank. SMTP authentication will likely fail.");
            return;
        }

        String sanitised = rawPassword.replaceAll("\\s+", "");
        if (sanitised.isEmpty()) {
            log.warn("spring.mail.password contains only whitespace. Please configure a valid SMTP password.");
            return;
        }

        if (!sanitised.equals(rawPassword)) {
            sender.setPassword(sanitised);
            log.warn("Whitespace detected in spring.mail.password. Applied sanitised value. " +
                    "Consider storing the mail password without spaces to avoid this warning.");
        }
    }

    private void verifySmtpConnectivity(JavaMailSenderImpl sender) {
        try {
            sender.testConnection();
            log.info("SMTP connection test succeeded (host: {}:{}, username: {}).",
                    sender.getHost(), sender.getPort(), sender.getUsername());
        } catch (MessagingException ex) {
            log.error(
                    "SMTP connection test failed (host: {}:{}, username: {}). {}",
                    sender.getHost(),
                    sender.getPort(),
                    sender.getUsername(),
                    ex.getMessage(),
                    ex
            );
        }
    }
}

