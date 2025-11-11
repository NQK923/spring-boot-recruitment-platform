package com.recruitment.platform.notification.service;

import com.recruitment.platform.notification.client.AuthServiceClient;
import com.recruitment.platform.notification.event.ApplicationStatusChangedEvent;
import com.recruitment.platform.notification.event.InterviewRescheduledEvent;
import com.recruitment.platform.notification.event.InterviewScheduledEvent;
import com.recruitment.platform.notification.event.PasswordResetRequestedEvent;
import com.recruitment.platform.notification.event.UserInvitedEvent;
import com.recruitment.platform.notification.event.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Configuration
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);
    private static final DateTimeFormatter OTP_EXPIRY_FORMATTER = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy").withZone(ZoneOffset.UTC);
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
    public Consumer<PasswordResetRequestedEvent> passwordResetRequestedEventConsumer() {
        return event -> {
            log.info("Received PasswordResetRequestedEvent for email: {}", event.email());
            String subject = "Password reset request";
            String expiryText = event.expiresAt() != null
                    ? "This code expires at " + OTP_EXPIRY_FORMATTER.format(event.expiresAt()) + " (UTC)."
                    : "This code will expire shortly.";
            String text = String.format(
                    "Hello!%n%nWe received a request to reset your password. Use the code below to continue:%n%s%n%s%n%nIf you didn't request a password reset, please ignore this email.",
                    event.otp(),
                    expiryText
            );
            sendEmail(event.email(), subject, text);
        };
    }

    @Bean
    public Consumer<UserRegisteredEvent> userRegisteredEventConsumer() {
        return event -> {
            log.info("Received UserRegisteredEvent for email: {}", event.email());
            String subject = "Welcome to the Recruitment Platform!";
            String text;
            if (event.verificationCode() != null) {
                String expiryText = event.expiresAt() != null
                        ? "This code expires at " + OTP_EXPIRY_FORMATTER.format(event.expiresAt()) + " (UTC)."
                        : "This code will expire shortly.";
                text = String.format(
                        "Hello!%n%nThank you for registering. Your email verification code is: %s%n%s%n%nIf you didn't create an account, please ignore this email.",
                        event.verificationCode(),
                        expiryText
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

            List<AuthServiceClient.UserEmailInfo> users = authServiceClient.getUsersByIds(new AuthServiceClient.BatchUserIdsRequest(List.of(event.candidateId())));
            if (users.isEmpty()) {
                log.error("Could not find user with ID: {}", event.candidateId());
                return;
            }
            String candidateEmail = users.get(0).email();

            String normalizedStatus = event.newStatus() != null ? event.newStatus().toUpperCase() : "UNKNOWN";
            Map<String, Object> metadata = event.metadata() != null ? event.metadata() : Map.of();

            String subject;
            String text;
            switch (normalizedStatus) {
                case "INTERVIEWING" -> {
                    String timeText = formatIso(metadata.get("interviewScheduledAt"));
                    String timezone = safeString(metadata.get("interviewTimezone"));
                    String location = safeString(metadata.get("interviewLocation"));
                    String instructions = safeString(metadata.get("interviewInstructions"));
                    subject = String.format("Lịch phỏng vấn cho hồ sơ #%d", event.applicationId());
                    text = """
                            Xin chào!

                            Đội ngũ tuyển dụng đã lên lịch phỏng vấn cho vị trí #%d.

                            • Thời gian: %s %s
                            • Địa điểm / liên kết: %s
                            %s

                            Nếu bạn cần thay đổi lịch, vui lòng trả lời email này hoặc liên hệ với nhà tuyển dụng.
                            """.formatted(
                            event.jobPostingId(),
                            timeText,
                            timezone.isBlank() ? "" : "(" + timezone + ")",
                            location.isBlank() ? "Sẽ được cập nhật" : location,
                            instructions.isBlank() ? "" : ("• Ghi chú: " + instructions)
                    );
                }
                case "OFFERED" -> {
                    String salaryAmount = safeString(metadata.get("offerSalaryAmount"));
                    String currency = safeString(metadata.get("offerCurrency"));
                    String notes = safeString(metadata.get("offerNotes"));
                    String expires = formatIso(metadata.get("offerExpiresAt"));
                    subject = String.format("Đề nghị cho hồ sơ #%d", event.applicationId());
                    text = """
                            Xin chào!

                            Chúng tôi rất vui được gửi tới bạn đề nghị làm việc cho vị trí #%d.

                            • Mức lương đề nghị: %s %s
                            • Thời hạn phản hồi: %s
                            %s

                            Hãy đăng nhập TalentFlow để chấp nhận hoặc từ chối đề nghị.
                            """.formatted(
                            event.jobPostingId(),
                            salaryAmount.isBlank() ? "Đang cập nhật" : salaryAmount,
                            currency.isBlank() ? "VND" : currency,
                            expires.isBlank() ? "Sẽ được thông báo" : expires,
                            notes.isBlank() ? "" : ("• Ghi chú thêm: " + notes)
                    );
                }
                case "HIRED" -> {
                    String decision = safeString(metadata.get("offerDecision"));
                    boolean accepted = "ACCEPTED".equalsIgnoreCase(decision);
                    subject = "Chúc mừng bạn đã nhận việc!";
                    text = accepted
                            ? """
                            Xin chúc mừng!

                            Bạn đã xác nhận đồng ý với đề nghị tuyển dụng và hồ sơ hiện ở trạng thái ĐÃ TUYỂN.
                            Bộ phận nhân sự sẽ sớm liên hệ để hoàn tất các bước tiếp theo.
                            """
                            : """
                            Xin chúc mừng!

                            Đội ngũ tuyển dụng đã chuyển hồ sơ sang trạng thái ĐÃ TUYỂN.
                            Chúng tôi sẽ tiếp tục đồng hành cùng bạn trong quá trình nhận việc.
                            """;
                }
                case "REJECTED" -> {
                    String decision = safeString(metadata.get("offerDecision"));
                    if ("DECLINED".equalsIgnoreCase(decision)) {
                        subject = "Bạn đã từ chối đề nghị";
                        text = """
                                Cảm ơn bạn đã phản hồi!

                                Chúng tôi đã ghi nhận quyết định từ chối đề nghị tuyển dụng.
                                Nếu muốn ứng tuyển vị trí khác trong tương lai, bạn luôn được chào đón quay lại TalentFlow.
                                """;
                    } else {
                        subject = String.format("Cập nhật hồ sơ #%d", event.applicationId());
                        text = String.format("Xin chào!%n%nHồ sơ của bạn cho vị trí #%d đã chuyển sang trạng thái: %s.", event.jobPostingId(), normalizedStatus);
                    }
                }
                default -> {
                    subject = String.format("Cập nhật hồ sơ #%d", event.applicationId());
                    text = String.format("Xin chào!%n%nTrạng thái hồ sơ của bạn cho vị trí #%d đã cập nhật thành: %s.", event.jobPostingId(), normalizedStatus);
                }
            }

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
        String host = null;
        Integer port = null;
        String username = fromEmail;
        if (mailSender instanceof JavaMailSenderImpl senderImpl) {
            host = senderImpl.getHost();
            port = senderImpl.getPort();
            if (senderImpl.getUsername() != null) {
                username = senderImpl.getUsername();
            }
        }

        log.debug("Attempting to send email [subject='{}'] from {} to {} via {}:{}", subject, username, to, host, port);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Successfully sent email to {} (subject='{}') via {}:{}", to, subject, host, port);
        } catch (Exception e) {
            log.error(
                    "Error sending email to {} via {}:{} (username: {}). {}",
                    to,
                    host,
                    port,
                    username,
                    e.getMessage(),
                    e
            );
        }
    }

    private String safeString(Object value) {
        if (value == null) {
            return "";
        }
        String str = String.valueOf(value).trim();
        return "null".equalsIgnoreCase(str) ? "" : str;
    }

    private String formatIso(Object value) {
        String raw = safeString(value);
        if (raw.isBlank()) {
            return "";
        }
        try {
            return OTP_EXPIRY_FORMATTER.format(Instant.parse(raw));
        } catch (Exception ex) {
            return raw;
        }
    }
}
