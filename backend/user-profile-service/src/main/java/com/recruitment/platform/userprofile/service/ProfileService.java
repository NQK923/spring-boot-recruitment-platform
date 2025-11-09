package com.recruitment.platform.userprofile.service;

import com.recruitment.platform.common.exception.BadRequestException;
import com.recruitment.platform.userprofile.client.ApplicationServiceClient;
import com.recruitment.platform.userprofile.client.FileStorageClient;
import com.recruitment.platform.userprofile.client.dto.AvatarUploadResponse;
import com.recruitment.platform.userprofile.client.dto.FileAvatarSyncRequest;
import com.recruitment.platform.userprofile.client.dto.FileUploadResponse;
import com.recruitment.platform.userprofile.dto.CertificationRequest;
import com.recruitment.platform.userprofile.dto.CvResponse;
import com.recruitment.platform.userprofile.dto.EducationRequest;
import com.recruitment.platform.userprofile.dto.ExperienceRequest;
import com.recruitment.platform.userprofile.dto.LanguageRequest;
import com.recruitment.platform.userprofile.dto.ProfileResponse;
import com.recruitment.platform.userprofile.dto.ProjectRequest;
import com.recruitment.platform.userprofile.dto.SkillRequest;
import com.recruitment.platform.userprofile.dto.UpdateEnrichedProfileRequest;
import com.recruitment.platform.userprofile.dto.UpdateProfileRequest;
import com.recruitment.platform.userprofile.event.UserRegisteredEvent;
import com.recruitment.platform.userprofile.model.Certification;
import com.recruitment.platform.userprofile.model.Cv;
import com.recruitment.platform.userprofile.model.Education;
import com.recruitment.platform.userprofile.model.Experience;
import com.recruitment.platform.userprofile.model.LanguageProficiency;
import com.recruitment.platform.userprofile.model.Profile;
import com.recruitment.platform.userprofile.model.ProfileLanguage;
import com.recruitment.platform.userprofile.model.Project;
import com.recruitment.platform.userprofile.model.Skill;
import com.recruitment.platform.userprofile.model.SkillProficiency;
import com.recruitment.platform.userprofile.repository.CertificationRepository;
import com.recruitment.platform.userprofile.repository.CvRepository;
import com.recruitment.platform.userprofile.repository.ProfileLanguageRepository;
import com.recruitment.platform.userprofile.repository.ProfileRepository;
import com.recruitment.platform.userprofile.repository.ProjectRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);

    private static final int MAX_TECH_STACK_ITEMS = 20;
    private static final int MAX_YEARS_EXPERIENCE = 60;
    private static final BigDecimal MAX_GPA = new BigDecimal("10.00");
    private static final BigDecimal MIN_GPA = BigDecimal.ZERO;
    private static final List<String> SUPPORTED_CV_LANGUAGES = List.of("vi", "en");

    private final ProfileRepository profileRepository;
    private final CvRepository cvRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final ProfileLanguageRepository profileLanguageRepository;
    private final ApplicationServiceClient applicationServiceClient;
    private final FileStorageClient fileStorageClient;

    public ProfileService(ProfileRepository profileRepository,
                          CvRepository cvRepository,
                          ProjectRepository projectRepository,
                          CertificationRepository certificationRepository,
                          ProfileLanguageRepository profileLanguageRepository,
                          ApplicationServiceClient applicationServiceClient,
                          FileStorageClient fileStorageClient) {
        this.profileRepository = profileRepository;
        this.cvRepository = cvRepository;
        this.projectRepository = projectRepository;
        this.certificationRepository = certificationRepository;
        this.profileLanguageRepository = profileLanguageRepository;
        this.applicationServiceClient = applicationServiceClient;
        this.fileStorageClient = fileStorageClient;
    }

    public void createProfileForNewUser(UserRegisteredEvent event) {
        if (profileRepository.existsById(event.userId())) {
            log.warn("Profile for user ID {} already exists. Ignoring event.", event.userId());
            return;
        }

        Profile profile = new Profile();
        profile.setUserId(event.userId());
        profileRepository.save(profile);
        log.info("Created new profile for user ID: {}", event.userId());
    }

    public Optional<ProfileResponse> getProfileView(Long userId) {
        return profileRepository.findById(userId).map(this::mapProfile);
    }

    @Transactional(readOnly = true)
    public List<Profile> getProfilesInBatch(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return List.of();
        }
        return profileRepository.findByUserIdIn(userIds);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getOrCreateProfileView(Long userId) {
        return mapProfile(getOrCreateProfileEntity(userId));
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        if (request == null) {
            throw new BadRequestException("Thiếu dữ liệu cập nhật hồ sơ.");
        }
        Profile profile = getOrCreateProfileEntity(userId);

        if (request.fullName() != null) {
            profile.setFullName(trimToNull(request.fullName()));
        }
        if (request.phoneNumber() != null) {
            profile.setPhoneNumber(trimToNull(request.phoneNumber()));
        }
        if (request.summary() != null) {
            profile.setSummary(trimToNull(request.summary()));
        }

        if (request.experiences() != null) {
            profile.getExperiences().clear();
            profile.getExperiences().addAll(mapExperiences(request.experiences()));
        }

        if (request.education() != null) {
            profile.getEducation().clear();
            profile.getEducation().addAll(mapEducation(request.education()));
        }

        if (request.skills() != null) {
            profile.getSkills().clear();
            profile.getSkills().addAll(mapSkills(request.skills()));
        }

        Profile saved = profileRepository.save(profile);
        return mapProfile(saved);
    }

    @Transactional
    public ProfileResponse updateProfileDetails(Long userId, UpdateEnrichedProfileRequest request) {
        if (request == null) {
            throw new BadRequestException("Thiếu dữ liệu cập nhật hồ sơ mở rộng.");
        }
        Profile profile = getOrCreateProfileEntity(userId);

        if (request.fullName() != null) {
            profile.setFullName(trimToNull(request.fullName()));
        }
        if (request.phoneNumber() != null) {
            profile.setPhoneNumber(trimToNull(request.phoneNumber()));
        }
        if (request.summary() != null) {
            profile.setSummary(trimToNull(request.summary()));
        }

        profile.setEmailForCv(trimToNull(request.emailForCv()));
        profile.setLocation(trimToNull(request.location()));
        profile.setWebsite(sanitizeUrl(request.website(), "website cá nhân"));
        profile.setLinkedin(sanitizeUrl(request.linkedin(), "LinkedIn"));
        profile.setGithub(sanitizeUrl(request.github(), "GitHub"));
        profile.setPortfolio(sanitizeUrl(request.portfolio(), "portfolio"));
        profile.setDesiredPosition(trimToNull(request.desiredPosition()));
        profile.setWorkAuthorization(trimToNull(request.workAuthorization()));

        if (request.yearsOfExperience() != null) {
            int years = Math.max(0, Math.min(MAX_YEARS_EXPERIENCE, request.yearsOfExperience()));
            profile.setYearsOfExperience(years);
        }

        profile.setOpenToRelocate(Boolean.TRUE.equals(request.openToRelocate()));

        if (StringUtils.hasText(request.preferredCvLanguage())) {
            String language = request.preferredCvLanguage().trim().toLowerCase(Locale.ROOT);
            validatePreferredLanguage(language);
            profile.setPreferredCvLanguage(language);
        }

        Profile saved = profileRepository.save(profile);
        return mapProfile(saved);
    }

    @Transactional
    public CvResponse uploadCv(Long userId, String versionName, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn tệp CV hợp lệ.");
        }

        Profile profile = getOrCreateProfileEntity(userId);
        FileUploadResponse response = fileStorageClient.uploadFile(file);
        if (response == null || response.fileId() == null) {
            throw new IllegalStateException("Không thể tải lên CV. Vui lòng thử lại.");
        }

        boolean shouldBeDefault = profile.getCvs().stream().noneMatch(Cv::isDefault);

        Cv cv = new Cv();
        cv.setProfile(profile);
        cv.setFileId(response.fileId());
        cv.setVersionName(versionName);
        cv.setDefault(shouldBeDefault);
        cv.setStoragePath(response.storagePath());
        cv.setStorageBucket(response.storageBucket());
        cv.setFileSize(response.size());

        Cv saved = cvRepository.save(cv);
        profile.getCvs().add(saved);
        return mapCv(saved);
    }

    @Transactional(readOnly = true)
    public List<CvResponse> listCvs(Long userId) {
        return cvRepository.findByProfile_UserId(userId).stream()
                .sorted(Comparator.comparing(Cv::getCreatedAt).reversed())
                .map(this::mapCv)
                .toList();
    }

    public boolean recruiterCanAccessCandidate(Long candidateId, Long companyId) {
        if (candidateId == null || companyId == null) {
            return false;
        }
        try {
            Boolean result = applicationServiceClient.candidateHasApplicationsForCompany(candidateId, companyId);
            return Boolean.TRUE.equals(result);
        } catch (FeignException ex) {
            log.error("Failed to verify candidate {} access for company {}.", candidateId, companyId, ex);
            throw new IllegalStateException("Unable to verify recruiter access at this time.");
        }
    }

    @Transactional
    public ProfileResponse updateAvatar(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Avatar file is required.");
        }

        Profile profile = getOrCreateProfileEntity(userId);
        AvatarUploadResponse response = fileStorageClient.uploadAvatar(file);
        if (response == null || !StringUtils.hasText(response.publicUrl())) {
            throw new IllegalStateException("Unable to upload avatar.");
        }
        profile.setAvatarPath(response.publicUrl());
        Profile saved = profileRepository.save(profile);
        return mapProfile(saved);
    }

    @Transactional
    public void syncAvatarFromExternalIfEmpty(Long userId, String sourceUrl, String fullName) {
        if (!StringUtils.hasText(sourceUrl) && !StringUtils.hasText(fullName)) {
            return;
        }
        Profile profile = getOrCreateProfileEntity(userId);
        boolean updated = false;

        if (StringUtils.hasText(fullName) && !StringUtils.hasText(profile.getFullName())) {
            profile.setFullName(fullName);
            updated = true;
            log.info("Synced full name for user {} from external provider.", userId);
        }

        if (StringUtils.hasText(sourceUrl) && !StringUtils.hasText(profile.getAvatarPath())) {
            try {
                AvatarUploadResponse response = fileStorageClient.syncAvatar(new FileAvatarSyncRequest(userId, sourceUrl));
                if (response != null && StringUtils.hasText(response.publicUrl())) {
                    profile.setAvatarPath(response.publicUrl());
                    updated = true;
                    log.info("Synced avatar for user {} from external provider.", userId);
                }
            } catch (Exception ex) {
                log.warn("Failed to sync avatar from {} for user {}: {}", sourceUrl, userId, ex.getMessage());
            }
        }

        if (updated) {
            profileRepository.save(profile);
        }
    }

    @Transactional(readOnly = true)
    public List<Project> listProjects(Long userId) {
        return projectRepository.findByProfile_UserId(userId).stream()
                .sorted(Comparator.comparing(Project::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Transactional
    public Project createProject(Long userId, ProjectRequest request) {
        Profile profile = getOrCreateProfileEntity(userId);
        Project project = new Project();
        project.setProfile(profile);
        applyProjectValues(project, request);
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long userId, Long projectId, ProjectRequest request) {
        Project project = projectRepository.findByIdAndProfile_UserId(projectId, userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy dự án cần cập nhật."));
        applyProjectValues(project, request);
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long userId, Long projectId) {
        Project project = projectRepository.findByIdAndProfile_UserId(projectId, userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy dự án cần xoá."));
        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public List<Certification> listCertifications(Long userId) {
        return certificationRepository.findByProfile_UserId(userId).stream()
                .sorted(Comparator.comparing(Certification::getIssueDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Transactional
    public Certification createCertification(Long userId, CertificationRequest request) {
        Profile profile = getOrCreateProfileEntity(userId);
        Certification certification = new Certification();
        certification.setProfile(profile);
        applyCertificationValues(certification, request);
        return certificationRepository.save(certification);
    }

    @Transactional
    public Certification updateCertification(Long userId, Long certificationId, CertificationRequest request) {
        Certification certification = certificationRepository.findByIdAndProfile_UserId(certificationId, userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy chứng chỉ cần cập nhật."));
        applyCertificationValues(certification, request);
        return certificationRepository.save(certification);
    }

    @Transactional
    public void deleteCertification(Long userId, Long certificationId) {
        Certification certification = certificationRepository.findByIdAndProfile_UserId(certificationId, userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy chứng chỉ cần xoá."));
        certificationRepository.delete(certification);
    }

    @Transactional(readOnly = true)
    public List<ProfileLanguage> listLanguages(Long userId) {
        return profileLanguageRepository.findByProfile_UserId(userId).stream()
                .sorted(Comparator.comparing(ProfileLanguage::getLanguage, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    @Transactional
    public ProfileLanguage createLanguage(Long userId, LanguageRequest request) {
        Profile profile = getOrCreateProfileEntity(userId);
        ProfileLanguage language = new ProfileLanguage();
        language.setProfile(profile);
        applyLanguageValues(language, request);
        return profileLanguageRepository.save(language);
    }

    @Transactional
    public ProfileLanguage updateLanguage(Long userId, Long languageId, LanguageRequest request) {
        ProfileLanguage language = profileLanguageRepository.findByIdAndProfile_UserId(languageId, userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy mục ngoại ngữ cần cập nhật."));
        applyLanguageValues(language, request);
        return profileLanguageRepository.save(language);
    }

    @Transactional
    public void deleteLanguage(Long userId, Long languageId) {
        ProfileLanguage language = profileLanguageRepository.findByIdAndProfile_UserId(languageId, userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy mục ngoại ngữ cần xoá."));
        profileLanguageRepository.delete(language);
    }

    private void applyProjectValues(Project project, ProjectRequest request) {
        if (request == null || !StringUtils.hasText(request.name())) {
            throw new BadRequestException("Tên dự án là bắt buộc.");
        }
        project.setName(request.name().trim());
        project.setRole(trimToNull(request.role()));
        project.setSummary(trimToNull(request.summary()));
        project.setResponsibilities(trimToNull(request.responsibilities()));
        project.setAchievements(trimToNull(request.achievements()));
        project.setTechStack(normalizeTechStack(request.techStack()));
        project.setProjectUrl(sanitizeUrl(request.projectUrl(), "đường dẫn dự án"));
        project.setRepoUrl(sanitizeUrl(request.repoUrl(), "đường dẫn kho mã"));
        LocalDate start = parseDate(request.startDate());
        LocalDate end = parseDate(request.endDate());
        boolean isCurrent = Boolean.TRUE.equals(request.isCurrent());
        validateDateRange(start, end, isCurrent, "dự án");
        project.setStartDate(start);
        project.setEndDate(end);
        project.setCurrent(isCurrent);
    }

    private void applyCertificationValues(Certification certification, CertificationRequest request) {
        if (request == null || !StringUtils.hasText(request.name())) {
            throw new BadRequestException("Tên chứng chỉ là bắt buộc.");
        }
        certification.setName(request.name().trim());
        certification.setIssuer(trimToNull(request.issuer()));
        LocalDate issueDate = parseDate(request.issueDate());
        LocalDate expireDate = parseDate(request.expireDate());
        if (issueDate != null && expireDate != null && expireDate.isBefore(issueDate)) {
            throw new BadRequestException("Ngày hết hạn phải sau hoặc bằng ngày cấp chứng chỉ.");
        }
        certification.setIssueDate(issueDate);
        certification.setExpireDate(expireDate);
        certification.setCredentialId(trimToNull(request.credentialId()));
        certification.setCredentialUrl(sanitizeUrl(request.credentialUrl(), "đường dẫn chứng chỉ"));
    }

    private void applyLanguageValues(ProfileLanguage language, LanguageRequest request) {
        if (request == null || !StringUtils.hasText(request.language())) {
            throw new BadRequestException("Vui lòng nhập tên ngoại ngữ.");
        }
        language.setLanguage(request.language().trim());
        LanguageProficiency proficiency = request.proficiency();
        if (proficiency == null) {
            throw new BadRequestException("Vui lòng chọn trình độ ngoại ngữ.");
        }
        language.setProficiency(proficiency);
    }

    private Profile getOrCreateProfileEntity(Long userId) {
        return profileRepository.findById(userId)
                .orElseGet(() -> {
                    Profile profile = new Profile();
                    profile.setUserId(userId);
                    return profileRepository.save(profile);
                });
    }

    private ProfileResponse mapProfile(Profile profile) {
        List<Experience> experiences = profile.getExperiences().stream()
                .sorted(Comparator.comparing(Experience::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        List<Education> education = profile.getEducation().stream()
                .sorted(Comparator.comparing(Education::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        List<Skill> skills = profile.getSkills().stream()
                .sorted(Comparator.comparing(Skill::getSkillName, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        List<Project> projects = profile.getProjects().stream()
                .sorted(Comparator.comparing(Project::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        List<Certification> certifications = profile.getCertifications().stream()
                .sorted(Comparator.comparing(Certification::getIssueDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        List<ProfileLanguage> languages = profile.getLanguages().stream()
                .sorted(Comparator.comparing(ProfileLanguage::getLanguage, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        List<CvResponse> cvResponses = profile.getCvs().stream()
                .sorted(Comparator.comparing(Cv::getCreatedAt).reversed())
                .map(this::mapCv)
                .toList();

        return new ProfileResponse(
                profile.getUserId(),
                profile.getFullName(),
                profile.getPhoneNumber(),
                profile.getSummary(),
                profile.getAvatarPath(),
                profile.getEmailForCv(),
                profile.getLocation(),
                profile.getWebsite(),
                profile.getLinkedin(),
                profile.getGithub(),
                profile.getPortfolio(),
                profile.getYearsOfExperience(),
                profile.getDesiredPosition(),
                profile.getWorkAuthorization(),
                profile.isOpenToRelocate(),
                profile.getPreferredCvLanguage(),
                experiences,
                education,
                skills,
                projects,
                certifications,
                languages,
                cvResponses
        );
    }

    private CvResponse mapCv(Cv cv) {
        UUID fileId = cv.getFileId();
        String fileIdString = fileId != null ? fileId.toString() : null;
        return new CvResponse(
                cv.getId(),
                cv.getVersionName(),
                cv.isDefault(),
                cv.getCreatedAt(),
                null,
                fileIdString,
                cv.getFileSize()
        );
    }

    private List<Experience> mapExperiences(List<ExperienceRequest> requests) {
        List<Experience> experiences = new ArrayList<>();
        for (ExperienceRequest request : requests) {
            if (request == null) {
                continue;
            }
            Experience experience = new Experience();
            experience.setTitle(trimToNull(request.title()));
            experience.setCompanyName(trimToNull(request.companyName()));
            experience.setDescription(trimToNull(request.description()));
            LocalDate startDate = parseDate(request.startDate());
            LocalDate endDate = parseDate(request.endDate());
            boolean isCurrent = Boolean.TRUE.equals(request.isCurrent());
            validateDateRange(startDate, endDate, isCurrent, "kinh nghiệm làm việc");
            experience.setStartDate(startDate);
            experience.setEndDate(endDate);
            experience.setLocation(trimToNull(request.location()));
            experience.setEmploymentType(request.employmentType());
            experience.setCurrent(isCurrent);
            experience.setAchievements(trimToNull(request.achievements()));
            experience.setTechStack(normalizeTechStack(request.techStack()));
            experiences.add(experience);
        }
        return experiences;
    }

    private List<Education> mapEducation(List<EducationRequest> requests) {
        List<Education> educationList = new ArrayList<>();
        for (EducationRequest request : requests) {
            if (request == null) {
                continue;
            }
            Education entry = new Education();
            entry.setSchool(trimToNull(request.school()));
            entry.setDegree(trimToNull(request.degree()));
            entry.setMajor(trimToNull(request.major()));
            entry.setGpa(parseGpa(request.gpa()));
            entry.setHonors(trimToNull(request.honors()));
            entry.setActivities(trimToNull(request.activities()));
            LocalDate startDate = parseDate(request.startDate());
            LocalDate endDate = parseDate(request.endDate());
            if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
                throw new BadRequestException("Ngày kết thúc học vấn phải sau hoặc bằng ngày bắt đầu.");
            }
            entry.setStartDate(startDate);
            entry.setEndDate(endDate);
            educationList.add(entry);
        }
        return educationList;
    }

    private List<Skill> mapSkills(List<SkillRequest> requests) {
        Map<String, Skill> deduplicated = new LinkedHashMap<>();
        for (SkillRequest request : requests) {
            if (request == null) {
                continue;
            }
            String name = trimToNull(request.skillName());
            if (!StringUtils.hasText(name)) {
                continue;
            }
            String key = name.toLowerCase(Locale.ROOT);
            Skill skill = new Skill();
            skill.setSkillName(name);
            skill.setProficiency(request.proficiency() != null ? request.proficiency() : SkillProficiency.INTERMEDIATE);
            if (request.years() != null) {
                int years = Math.max(0, Math.min(MAX_YEARS_EXPERIENCE, request.years()));
                skill.setYears(years);
            } else {
                skill.setYears(null);
            }
            deduplicated.put(key, skill);
        }
        return new ArrayList<>(deduplicated.values());
    }

    private LocalDate parseDate(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (Exception ex) {
            throw new BadRequestException("Định dạng ngày không hợp lệ: " + value);
        }
    }

    private BigDecimal parseGpa(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            BigDecimal gpa = new BigDecimal(value.trim());
            if (gpa.compareTo(MIN_GPA) < 0 || gpa.compareTo(MAX_GPA) > 0) {
                throw new BadRequestException("GPA phải nằm trong khoảng 0 - 10.");
            }
            return gpa.setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException ex) {
            throw new BadRequestException("GPA không hợp lệ.");
        }
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate, boolean isCurrent, String context) {
        if (!isCurrent && startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("Ngày kết thúc của " + context + " phải sau hoặc bằng ngày bắt đầu.");
        }
    }

    private void validatePreferredLanguage(String language) {
        if (!SUPPORTED_CV_LANGUAGES.contains(language)) {
            throw new BadRequestException("Ngôn ngữ CV chỉ hỗ trợ: " + String.join(", ", SUPPORTED_CV_LANGUAGES));
        }
    }

    private String sanitizeUrl(String url, String fieldName) {
        if (!StringUtils.hasText(url)) {
            return null;
        }
        try {
            URI uri = new URI(url.trim());
            String scheme = uri.getScheme();
            if (!StringUtils.hasText(scheme) || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))) {
                throw new BadRequestException("Liên kết " + fieldName + " phải bắt đầu bằng http hoặc https.");
            }
            return uri.toString();
        } catch (URISyntaxException ex) {
            throw new BadRequestException("Liên kết " + fieldName + " không hợp lệ.");
        }
    }

    private List<String> normalizeTechStack(List<String> stack) {
        if (stack == null || stack.isEmpty()) {
            return List.of();
        }
        Map<String, String> dedup = new LinkedHashMap<>();
        for (String value : stack) {
            if (!StringUtils.hasText(value)) {
                continue;
            }
            String trimmed = value.trim();
            String key = trimmed.toLowerCase(Locale.ROOT);
            dedup.putIfAbsent(key, trimmed);
        }
        return dedup.values().stream()
                .limit(MAX_TECH_STACK_ITEMS)
                .collect(Collectors.toList());
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
