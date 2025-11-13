package com.recruitment.platform.userprofile.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.platform.userprofile.dto.*;
import com.recruitment.platform.userprofile.model.*;
import com.recruitment.platform.userprofile.service.ProfileService;
import com.recruitment.platform.userprofile.service.cv.CvGeneratorService;
import com.recruitment.platform.userprofile.service.cv.model.CvGenerationResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProfileController.class)
class ProfileControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private ProfileService profileService;
    @MockBean private CvGeneratorService cvGeneratorService;

    private final Long userId = 100L;

    @Test
    @WithMockUser(authorities = "SCOPE_CANDIDATE")
    void shouldGetMyProfile() throws Exception {
        ProfileResponse response = new ProfileResponse(
                userId, "Name", "123", "Sum", "avatar.jpg", null, null, null, null, null, null,
                5, "Dev", "VN", true, "vi",
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of()
        );

        when(profileService.getOrCreateProfileView(userId)).thenReturn(response);

        mockMvc.perform(get("/api/profiles/me")
                        .with(jwt().jwt(jwt -> jwt.subject("100"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Name"));
    }

    @Test
    @WithMockUser(authorities = "SCOPE_CANDIDATE")
    void shouldUploadCv() throws Exception {
        CvResponse cv = new CvResponse(1L, "v1", true, LocalDate.now(), null, UUID.randomUUID().toString(), 1024L);
        MockMultipartFile file = new MockMultipartFile("file", "cv.pdf", "application/pdf", "PDF".getBytes());

        when(profileService.uploadCv(eq(userId), eq("v1"), any())).thenReturn(cv);

        mockMvc.perform(multipart("/api/profiles/me/cvs/upload")
                        .file(file)
                        .param("versionName", "v1")
                        .with(jwt().jwt(jwt -> jwt.subject("100"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.versionName").value("v1"));
    }

    @Test
    @WithMockUser(authorities = "SCOPE_RECRUITER")
    void shouldAllowRecruiterAccess() throws Exception {
        ProfileResponse profile = new ProfileResponse(userId, "Candidate", null, null, null, null, null, null, null, null, null,
                null, null, null, false, "vi", List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of());

        when(profileService.recruiterCanAccessCandidate(userId, 99L)).thenReturn(true);
        when(profileService.getProfileView(userId)).thenReturn(Optional.of(profile));

        mockMvc.perform(get("/api/profiles/{userId}", userId)
                        .header("X-Company-ID", "99")
                        .with(jwt().authorities(org.springframework.security.core.authority.SimpleGrantedAuthority::new, "SCOPE_RECRUITER")))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "SCOPE_RECRUITER")
    void shouldForbidRecruiterAccess() throws Exception {
        when(profileService.recruiterCanAccessCandidate(userId, 99L)).thenReturn(false);

        mockMvc.perform(get("/api/profiles/{userId}", userId)
                        .header("X-Company-ID", "99")
                        .with(jwt()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "SCOPE_CANDIDATE")
    void shouldGenerateCvPdf() throws Exception {
        byte[] pdf = "PDF CONTENT".getBytes();
        CvGenerationResult result = new CvGenerationResult("cv.pdf", pdf);

        when(cvGeneratorService.generate(eq(userId), any())).thenReturn(result);

        mockMvc.perform(post("/api/profiles/me/cvs/generate")
                        .param("save", "false")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
                        .with(jwt().jwt(jwt -> jwt.subject("100"))))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"cv.pdf\""))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    @WithMockUser(authorities = "SCOPE_CANDIDATE")
    void shouldCreateCertification() throws Exception {
        Certification cert = new Certification();
        cert.setId(1L); cert.setName("AWS"); cert.setIssuer("Amazon");

        when(profileService.createCertification(eq(userId), any())).thenReturn(cert);

        CertificationRequest req = new CertificationRequest("AWS", "Amazon", "2023-01-01", null, null, null);

        mockMvc.perform(post("/api/profiles/me/certifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(jwt().jwt(jwt -> jwt.subject("100"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("AWS"));
    }
}