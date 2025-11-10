package com.recruitment.platform.userprofile.service.cv;

import com.recruitment.platform.common.exception.BadRequestException;
import com.recruitment.platform.userprofile.config.CvProperties;
import com.recruitment.platform.userprofile.dto.CvGenerateRequest;
import com.recruitment.platform.userprofile.model.Profile;
import com.recruitment.platform.userprofile.repository.ProfileRepository;
import com.recruitment.platform.userprofile.service.cv.model.CvDocument;
import com.recruitment.platform.userprofile.service.cv.model.CvGenerationResult;
import com.recruitment.platform.userprofile.service.prompt.PromptFactory;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;

@Service
public class CvGeneratorService {

    private static final Logger LOG = LoggerFactory.getLogger(CvGeneratorService.class);
    private static final Set<String> SUPPORTED_LANGUAGES = Set.of("vi", "en");
    private static final Set<String> SUPPORTED_TONES = Set.of("neutral", "formal");
    private static final DateTimeFormatter FILE_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final ProfileRepository profileRepository;
    private final PromptFactory promptFactory;
    private final GeminiCvWriter geminiCvWriter;
    private final CvRenderer cvRenderer;
    private final CvGenerationRateLimiter rateLimiter;
    private final CvProperties cvProperties;

    public CvGeneratorService(ProfileRepository profileRepository,
                              PromptFactory promptFactory,
                              GeminiCvWriter geminiCvWriter,
                              CvRenderer cvRenderer,
                              CvGenerationRateLimiter rateLimiter,
                              CvProperties cvProperties) {
        this.profileRepository = profileRepository;
        this.promptFactory = promptFactory;
        this.geminiCvWriter = geminiCvWriter;
        this.cvRenderer = cvRenderer;
        this.rateLimiter = rateLimiter;
        this.cvProperties = cvProperties;
    }

    @Transactional
    public CvGenerationResult generate(Long userId, CvGenerateRequest request) {
        rateLimiter.verifyCanGenerate(userId);
        Profile profile = profileRepository.findById(userId)
                .orElseGet(() -> {
                    Profile created = new Profile();
                    created.setUserId(userId);
                    return profileRepository.save(created);
                });

        String language = resolveLanguage(request, profile);
        String tone = resolveTone(request);
        String templateCode = resolveTemplate(request);

        String prompt = promptFactory.build(profile, language, tone);
        LOG.debug("Đã tạo prompt CV dài {} ký tự cho user {}", prompt.length(), userId);

        CvDocument document = geminiCvWriter.generateDocument(prompt);
        document.setLanguage(language);
        backfillDocument(document, profile);
        byte[] pdf = cvRenderer.render(templateCode, document);
        String fileName = buildFileName(document.getFullName());
        return new CvGenerationResult(fileName, pdf);
    }

    private void backfillDocument(CvDocument document, Profile profile) {
        if (document.getLinks() == null) {
            document.setLinks(new CvDocument.Links());
        }
        if (StringUtils.isBlank(document.getFullName())) {
            document.setFullName(StringUtils.isNotBlank(profile.getFullName()) ? profile.getFullName() : "Ứng viên");
        }
        if (StringUtils.isBlank(document.getTitle()) && StringUtils.isNotBlank(profile.getDesiredPosition())) {
            document.setTitle(profile.getDesiredPosition());
        }
        if (StringUtils.isBlank(document.getSummary()) && StringUtils.isNotBlank(profile.getSummary())) {
            document.setSummary(profile.getSummary());
        }
        if (StringUtils.isBlank(document.getEmail()) && StringUtils.isNotBlank(profile.getEmailForCv())) {
            document.setEmail(profile.getEmailForCv());
        }
        if (StringUtils.isBlank(document.getPhone()) && StringUtils.isNotBlank(profile.getPhoneNumber())) {
            document.setPhone(profile.getPhoneNumber());
        }
        if (StringUtils.isBlank(document.getLocation()) && StringUtils.isNotBlank(profile.getLocation())) {
            document.setLocation(profile.getLocation());
        }
        if (document.getLinks() != null) {
            if (StringUtils.isBlank(document.getLinks().getLinkedin()) && StringUtils.isNotBlank(profile.getLinkedin())) {
                document.getLinks().setLinkedin(profile.getLinkedin());
            }
            if (StringUtils.isBlank(document.getLinks().getGithub()) && StringUtils.isNotBlank(profile.getGithub())) {
                document.getLinks().setGithub(profile.getGithub());
            }
            if (StringUtils.isBlank(document.getLinks().getWebsite()) && StringUtils.isNotBlank(profile.getWebsite())) {
                document.getLinks().setWebsite(profile.getWebsite());
            }
        }
    }

    private String resolveLanguage(CvGenerateRequest request, Profile profile) {
        String candidate = request != null ? StringUtils.trimToNull(request.getLanguage()) : null;
        if (candidate == null) {
            candidate = StringUtils.trimToNull(profile.getPreferredCvLanguage());
        }
        if (candidate == null) {
            candidate = cvProperties.getDefaults().getLanguage();
        }
        String normalized = candidate.toLowerCase(Locale.ROOT);
        if (!SUPPORTED_LANGUAGES.contains(normalized)) {
            throw new BadRequestException("Ngôn ngữ CV không hợp lệ. Chỉ hỗ trợ vi hoặc en.");
        }
        return normalized;
    }

    private String resolveTone(CvGenerateRequest request) {
        String candidate = request != null ? StringUtils.trimToNull(request.getTone()) : null;
        if (candidate == null) {
            candidate = cvProperties.getDefaults().getTone();
        }
        String normalized = candidate.toLowerCase(Locale.ROOT);
        if (!SUPPORTED_TONES.contains(normalized)) {
            throw new BadRequestException("Giọng văn CV không hợp lệ.");
        }
        return normalized;
    }

    private String resolveTemplate(CvGenerateRequest request) {
        String candidate = request != null ? StringUtils.trimToNull(request.getTemplateCode()) : null;
        if (candidate == null) {
            candidate = cvProperties.getDefaults().getTemplate();
        }
        return candidate.toLowerCase(Locale.ROOT);
    }

    private String buildFileName(String fullName) {
        String base = StringUtils.isNotBlank(fullName) ? fullName : "Ung-vien";
        String sanitized = base.replaceAll("[^\\p{L}\\p{N}\\s-]", "").trim().replaceAll("\\s+", "-");
        if (sanitized.isEmpty()) {
            sanitized = "Ung-vien";
        }
        return "CV_%s_%s.pdf".formatted(sanitized, FILE_DATE.format(LocalDate.now()));
    }
}
