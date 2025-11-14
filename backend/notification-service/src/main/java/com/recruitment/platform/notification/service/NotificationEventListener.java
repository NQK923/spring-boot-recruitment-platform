package com.recruitment.platform.notification.service;

import com.recruitment.platform.notification.client.AuthServiceClient;
import com.recruitment.platform.notification.event.ApplicationStatusChangedEvent;
import com.recruitment.platform.notification.event.CompanyStatusChangedEvent;
import com.recruitment.platform.notification.event.CompanyUserLockedEvent;
import com.recruitment.platform.notification.event.InterviewRescheduledEvent;
import com.recruitment.platform.notification.event.InterviewScheduledEvent;
import com.recruitment.platform.notification.event.PasswordResetRequestedEvent;
import com.recruitment.platform.notification.event.UserInvitedEvent;
import com.recruitment.platform.notification.event.UserRegisteredEvent;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Configuration
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);
    private static final DateTimeFormatter OTP_EXPIRY_FORMATTER = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy").withZone(ZoneOffset.UTC);
    private final JavaMailSender mailSender;
    private final AuthServiceClient authServiceClient;
    private final EmailTemplateRenderer emailTemplateRenderer;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    public NotificationEventListener(JavaMailSender mailSender,
                                     AuthServiceClient authServiceClient,
                                     EmailTemplateRenderer emailTemplateRenderer) {
        this.mailSender = mailSender;
        this.authServiceClient = authServiceClient;
        this.emailTemplateRenderer = emailTemplateRenderer;
    }

    @Bean
    public Consumer<UserInvitedEvent> userInvitedEventConsumer() {
        return event -> {
            log.info("Received UserInvitedEvent for email: {}", event.email());
            String subject = "Lời mời tham gia " + emailTemplateRenderer.getBrandName();
            String invitationUrl = buildFrontendUrl("/accept-invite?token=" + event.token());
            String text = emailTemplateRenderer.render(
                    subject,
                    List.of(
                            String.format("Bạn nhận được lời mời gia nhập không gian tuyển dụng với vai trò %s.", safeString(event.roleToGrant())),
                            "Hãy xác nhận để bắt đầu cộng tác và sử dụng đầy đủ tính năng của nền tảng."
                    ),
                    "Chấp nhận lời mời",
                    invitationUrl,
                    "Liên kết chỉ sử dụng một lần nhằm đảm bảo bảo mật tài khoản."
            );
            sendEmail(event.email(), subject, text);
        };
    }

    @Bean
    public Consumer<PasswordResetRequestedEvent> passwordResetRequestedEventConsumer() {
        return event -> {
            log.info("Received PasswordResetRequestedEvent for email: {}", event.email());
            String subject = "Xác nhận đặt lại mật khẩu";
            String expiryText = event.expiresAt() != null
                    ? "Mã sẽ hết hạn lúc " + OTP_EXPIRY_FORMATTER.format(event.expiresAt()) + " (UTC)."
                    : "Mã chỉ có hiệu lực trong vài phút.";
            String text = emailTemplateRenderer.render(
                    "Xác nhận đặt lại mật khẩu",
                    List.of(
                            "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản " + emailTemplateRenderer.getBrandName() + " của bạn.",
                            "Mã OTP xác thực: " + event.otp(),
                            expiryText
                    ),
                    null,
                    null,
                    "Nếu bạn không phải là người gửi yêu cầu, hãy bỏ qua email này và bảo vệ thông tin đăng nhập."
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
                        ? "Mã sẽ hết hạn lúc " + OTP_EXPIRY_FORMATTER.format(event.expiresAt()) + " (UTC)."
                        : "Mã sẽ hết hạn trong ít phút tới.";
                text = emailTemplateRenderer.render(
                        "Hoàn tất xác minh email",
                        List.of(
                                "Cảm ơn bạn đã tạo tài khoản trên " + emailTemplateRenderer.getBrandName() + ".",
                                "Mã xác minh: " + event.verificationCode(),
                                expiryText
                        ),
                        "Truy cập " + emailTemplateRenderer.getBrandName(),
                        buildFrontendUrl("/login"),
                        "Nếu bạn không thực hiện đăng ký, hãy bỏ qua email này."
                );
            } else {
                text = emailTemplateRenderer.render(
                        "Chào mừng bạn đến với " + emailTemplateRenderer.getBrandName(),
                        List.of(
                                "Tài khoản của bạn đã được tạo thành công.",
                                "Đăng nhập để cập nhật hồ sơ và bắt đầu quản lý quy trình tuyển dụng."
                        ),
                        "Đăng nhập",
                        buildFrontendUrl("/login"),
                        null
                );
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

            String jobTitle = safeString(event.jobTitle());
            String jobLocation = safeString(event.jobLocation());
            String jobLabel = jobTitle.isBlank()
                    ? "một vị trí đang tuyển"
                    : jobTitle;
            String jobDisplay = jobLocation.isBlank()
                    ? jobLabel
                    : jobLabel + " – " + jobLocation;

            String normalizedStatus = event.newStatus() != null ? event.newStatus().toUpperCase() : "UNKNOWN";
            Map<String, Object> metadata = event.metadata() != null ? event.metadata() : Map.of();

            String candidatePortalUrl = buildFrontendUrl("/candidate/applications");
            String actionUrl = candidatePortalUrl;
            String actionLabel = "Xem trạng thái hồ sơ";
            String subject = "Cập nhật hồ sơ: " + jobLabel;
            String headline = subject;
            String closing = null;
            List<String> paragraphs = new ArrayList<>();
            paragraphs.add("Chúng tôi vừa cập nhật trạng thái hồ sơ của bạn cho " + jobDisplay + " thành: " + normalizedStatus + ".");

            switch (normalizedStatus) {
                case "INTERVIEWING" -> {
                    String timeText = formatIso(metadata.get("interviewScheduledAt"));
                    String timezone = safeString(metadata.get("interviewTimezone"));
                    String location = safeString(metadata.get("interviewLocation"));
                    String instructions = safeString(metadata.get("interviewInstructions"));
                    subject = "Lịch phỏng vấn: " + jobLabel;
                    headline = "Lịch phỏng vấn cho " + jobDisplay;
                    paragraphs.clear();
                    paragraphs.add("Đội ngũ tuyển dụng đã sắp xếp một buổi phỏng vấn mới.");
                    paragraphs.add("• Thời gian: " + (timeText.isBlank() ? "Sẽ được cập nhật" : timeText) + (timezone.isBlank() ? "" : " (" + timezone + ")"));
                    paragraphs.add("• Địa điểm / liên kết: " + (location.isBlank() ? "Sẽ được gửi sau" : location));
                    if (!instructions.isBlank()) {
                        paragraphs.add("• Ghi chú: " + instructions);
                    }
                    actionLabel = "Xem lịch phỏng vấn";
                    actionUrl = candidatePortalUrl;
                }
                case "OFFERED" -> {
                    String salaryAmount = safeString(metadata.get("offerSalaryAmount"));
                    String currency = safeString(metadata.get("offerCurrency"));
                    String notes = safeString(metadata.get("offerNotes"));
                    String expires = formatIso(metadata.get("offerExpiresAt"));
                    subject = "Đề nghị làm việc: " + jobLabel;
                    headline = "Đề nghị làm việc cho " + jobDisplay;
                    paragraphs.clear();
                    paragraphs.add("Chúng tôi rất vui được gửi tới bạn đề nghị làm việc chính thức.");
                    paragraphs.add("• Mức lương đề nghị: " + (salaryAmount.isBlank() ? "Đang cập nhật" : salaryAmount) + " " + (currency.isBlank() ? "VND" : currency));
                    paragraphs.add("• Thời hạn phản hồi: " + (expires.isBlank() ? "Sẽ được thông báo" : expires));
                    if (!notes.isBlank()) {
                        paragraphs.add("• Ghi chú thêm: " + notes);
                    }
                    actionLabel = "Xem chi tiết đề nghị";
                    actionUrl = candidatePortalUrl;
                }
                case "HIRED" -> {
                    String decision = safeString(metadata.get("offerDecision"));
                    boolean accepted = "ACCEPTED".equalsIgnoreCase(decision);
                    subject = "Chúc mừng bạn đã nhận việc!";
                    headline = subject;
                    paragraphs.clear();
                    if (accepted) {
                        paragraphs.add("Bạn đã xác nhận đồng ý với đề nghị tuyển dụng và hồ sơ đang ở trạng thái ĐÃ TUYỂN.");
                    } else {
                        paragraphs.add("Đội ngũ tuyển dụng đã chuyển hồ sơ sang trạng thái ĐÃ TUYỂN.");
                    }
                    paragraphs.add("Bộ phận nhân sự sẽ sớm liên hệ để hướng dẫn các bước tiếp theo.");
                    actionLabel = null;
                    actionUrl = null;
                }
                case "REJECTED" -> {
                    String decision = safeString(metadata.get("offerDecision"));
                    paragraphs.clear();
                    if ("DECLINED".equalsIgnoreCase(decision)) {
                        subject = "Bạn đã từ chối đề nghị";
                        headline = subject;
                        paragraphs.add("Chúng tôi đã ghi nhận quyết định từ chối đề nghị tuyển dụng của bạn.");
                        paragraphs.add("Rất mong sẽ tiếp tục đồng hành với bạn trong những cơ hội phù hợp khác.");
                        actionLabel = null;
                        actionUrl = null;
                    } else {
                        subject = "Cập nhật hồ sơ: " + jobLabel;
                        headline = subject;
                        paragraphs.add("Rất tiếc hồ sơ của bạn cho " + jobDisplay + " đã được chuyển sang trạng thái khác: " + normalizedStatus + ".");
                        paragraphs.add("Đừng nản lòng – bạn có thể tiếp tục theo dõi các vị trí mới trên " + emailTemplateRenderer.getBrandName() + ".");
                    }
                }
                default -> {
                    subject = "Cập nhật hồ sơ: " + jobLabel;
                    headline = subject;
                }
            }

            String text = emailTemplateRenderer.render(headline, paragraphs, actionLabel, actionUrl, closing);
            sendEmail(candidateEmail, subject, text);
        };
    }

    @Bean
    public Consumer<CompanyUserLockedEvent> companyUserLockedEventConsumer() {
        return event -> {
            if (!event.locked()) {
                return;
            }
            try {
                List<AuthServiceClient.UserEmailInfo> infos = authServiceClient.getUsersByIds(
                        new AuthServiceClient.BatchUserIdsRequest(List.of(event.userId())));
                String recipient = infos == null ? null :
                        infos.stream()
                                .filter(info -> info.id() != null && info.id().equals(event.userId()))
                                .map(AuthServiceClient.UserEmailInfo::email)
                                .filter(email -> email != null && !email.isBlank())
                                .findFirst()
                                .orElse(null);

                if (recipient == null) {
                    log.warn("Cannot send lock notification, email not found for user {}", event.userId());
                    return;
                }

                String companyLabel = Optional.ofNullable(event.companyName())
                        .filter(name -> !name.isBlank())
                        .orElse("công ty của bạn");
                String lockedAt = event.occurredAt() != null
                        ? OTP_EXPIRY_FORMATTER.format(event.occurredAt()) + " (UTC)"
                        : "thời điểm gần đây";

                String subject = "Tài khoản tuyển dụng của bạn đã bị khóa";
                String text = emailTemplateRenderer.render(
                        subject,
                        List.of(
                                String.format("Tài khoản tại %s đã bị quản trị viên khóa vào %s.", companyLabel, lockedAt),
                                "Bạn sẽ không thể đăng nhập hay thao tác trên " + emailTemplateRenderer.getBrandName() + " cho tới khi được mở lại quyền truy cập."
                        ),
                        null,
                        null,
                        "Vui lòng liên hệ quản trị viên công ty để được hỗ trợ mở khóa."
                );

                sendEmail(recipient, subject, text);
            } catch (Exception ex) {
                log.warn("Failed to process CompanyUserLockedEvent for user {}: {}", event.userId(), ex.getMessage());
            }
        };
    }

    @Bean
    public Consumer<CompanyStatusChangedEvent> companyStatusChangedEventConsumer() {
        return event -> {
            if (event.adminUserIds() == null || event.adminUserIds().isEmpty()) {
                log.info("Skip status change email for company {} because no admins found in event payload", event.companyId());
                return;
            }
            try {
                List<AuthServiceClient.UserEmailInfo> infos = authServiceClient.getUsersByIds(
                        new AuthServiceClient.BatchUserIdsRequest(event.adminUserIds()));

                Map<Long, String> emailMap = infos == null ? Map.of() :
                        infos.stream()
                                .filter(info -> info.id() != null && info.email() != null && !info.email().isBlank())
                                .collect(Collectors.toMap(AuthServiceClient.UserEmailInfo::id, AuthServiceClient.UserEmailInfo::email));

                List<String> recipients = event.adminUserIds().stream()
                        .map(emailMap::get)
                        .filter(email -> email != null && !email.isBlank())
                        .distinct()
                        .toList();

                if (recipients.isEmpty()) {
                    log.warn("No admin emails resolved for company {}", event.companyId());
                    return;
                }

                String companyLabel = Optional.ofNullable(event.companyName())
                        .filter(name -> !name.isBlank())
                        .orElse("công ty của bạn");
                String previousStatus = resolveStatusLabel(event.previousStatus());
                String newStatus = resolveStatusLabel(event.newStatus());
                String timestamp = event.occurredAt() != null
                        ? OTP_EXPIRY_FORMATTER.format(event.occurredAt()) + " (UTC)"
                        : "thời điểm gần đây";

                String subject = String.format("Trạng thái %s đã thay đổi", companyLabel);
                String text = emailTemplateRenderer.render(
                        subject,
                        List.of(
                                String.format("Trạng thái của %s vừa được cập nhật vào %s.", companyLabel, timestamp),
                                "• Trước đó: " + previousStatus,
                                "• Hiện tại: " + newStatus
                        ),
                        "Đăng nhập để kiểm tra",
                        buildFrontendUrl("/dashboard/company"),
                        "Nếu có yêu cầu bổ sung, vui lòng hoàn tất sớm để quy trình tuyển dụng không bị gián đoạn."
                );

                recipients.forEach(recipient -> sendEmail(recipient, subject, text));
            } catch (Exception ex) {
                log.warn("Failed to process CompanyStatusChangedEvent for company {}: {}", event.companyId(), ex.getMessage());
            }
        };
    }

    private String resolveStatusLabel(String status) {
        if (status == null || status.isBlank()) {
            return "Chưa xác định";
        }
        return switch (status.toUpperCase()) {
            case "ACTIVE" -> "Đang hoạt động";
            case "PENDING" -> "Chờ duyệt";
            case "SUSPENDED" -> "Tạm ngưng";
            case "INACTIVE" -> "Không hoạt động";
            default -> status;
        };
    }

    @Bean
    public Consumer<InterviewScheduledEvent> interviewScheduledEventConsumer() {
        return event -> {
            log.info("Received InterviewScheduledEvent for interview ID: {}", event.interviewId());

            // Fetch emails for all participants
            List<AuthServiceClient.UserEmailInfo> users = authServiceClient.getUsersByIds(new AuthServiceClient.BatchUserIdsRequest(event.participantUserIds()));
            Map<Long, String> userIdToEmailMap = users.stream().collect(Collectors.toMap(AuthServiceClient.UserEmailInfo::id, AuthServiceClient.UserEmailInfo::email));

            String jobTitle = safeString(event.jobTitle());
            String jobLocation = safeString(event.jobLocation());
            String jobLabel = jobTitle.isBlank() ? "một vị trí đang tuyển" : jobTitle;
            String jobDisplay = jobLocation.isBlank() ? jobLabel : jobLabel + " – " + jobLocation;
            String scheduleTime = formatIso(event.scheduleTime());
            String timezone = safeString(event.timezone());
            String location = safeString(event.locationOrLink());

            String subject = "Lịch phỏng vấn: " + jobLabel;
            String text = emailTemplateRenderer.render(
                    subject,
                    List.of(
                            "Buổi phỏng vấn cho " + jobDisplay + " đã được sắp xếp.",
                            "• Thời gian: " + (scheduleTime.isBlank() ? "Sẽ được cập nhật" : scheduleTime) + (timezone.isBlank() ? "" : " (" + timezone + ")"),
                            "• Địa điểm / liên kết: " + (location.isBlank() ? "Sẽ được gửi thêm" : location),
                            "Nếu bạn không thể tham dự, vui lòng phản hồi email này hoặc cập nhật trực tiếp trên " + emailTemplateRenderer.getBrandName() + "."
                    ),
                    "Xem lịch phỏng vấn",
                    buildFrontendUrl("/dashboard/interviews"),
                    null
            );

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

            String jobTitle = safeString(event.jobTitle());
            String jobLocation = safeString(event.jobLocation());
            String jobLabel = jobTitle.isBlank() ? "một vị trí đang tuyển" : jobTitle;
            String jobDisplay = jobLocation.isBlank() ? jobLabel : jobLabel + " – " + jobLocation;
            String newTime = formatIso(event.newScheduleTime());
            String timezone = safeString(event.timezone());
            String location = safeString(event.locationOrLink());

            String subject = "Cập nhật lịch phỏng vấn: " + jobLabel;
            String text = emailTemplateRenderer.render(
                    subject,
                    List.of(
                            "Buổi phỏng vấn cho " + jobDisplay + " vừa được cập nhật thời gian mới.",
                            "• Thời gian mới: " + (newTime.isBlank() ? "Sẽ được cập nhật" : newTime) + (timezone.isBlank() ? "" : " (" + timezone + ")"),
                            "• Địa điểm / liên kết: " + (location.isBlank() ? "Sẽ được gửi thêm" : location),
                            "Nếu lịch mới không phù hợp, hãy phản hồi email này để chúng tôi hỗ trợ sắp xếp lại."
                    ),
                    "Xem lịch phỏng vấn",
                    buildFrontendUrl("/dashboard/interviews"),
                    null
            );

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

    private String buildFrontendUrl(String path) {
        String base = frontendBaseUrl == null || frontendBaseUrl.isBlank() ? "http://localhost:3000" : frontendBaseUrl;
        if (path == null || path.isBlank()) {
            return base;
        }
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        boolean baseEndsWithSlash = base.endsWith("/");
        boolean pathStartsWithSlash = path.startsWith("/");
        if (baseEndsWithSlash && pathStartsWithSlash) {
            return base + path.substring(1);
        }
        if (!baseEndsWithSlash && !pathStartsWithSlash) {
            return base + "/" + path;
        }
        return base + path;
    }

    private void sendEmail(String to, String subject, String htmlBody) {
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
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
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
