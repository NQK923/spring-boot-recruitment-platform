package com.recruitment.platform.userprofile.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.platform.userprofile.dto.ProfileAvatarSyncRequest;
import com.recruitment.platform.userprofile.service.ProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProfileInternalController.class)
class ProfileInternalControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private ProfileService profileService;

    private final Long userId = 100L;

    @Test
    void shouldSyncAvatarWhenSourceUrlProvided() throws Exception {
        ProfileAvatarSyncRequest request = new ProfileAvatarSyncRequest("https://old.com/avatar.jpg", null);

        mockMvc.perform(post("/api/internal/profiles/{userId}/avatar", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted());

        verify(profileService).syncAvatarFromExternalIfEmpty(eq(userId), eq("https://old.com/avatar.jpg"), isNull());
    }

    @Test
    void shouldSyncFullNameWhenProvided() throws Exception {
        ProfileAvatarSyncRequest request = new ProfileAvatarSyncRequest(null, "Synced Name");

        mockMvc.perform(post("/api/internal/profiles/{userId}/avatar", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted());

        verify(profileService).syncAvatarFromExternalIfEmpty(eq(userId), isNull(), eq("Synced Name"));
    }

    @Test
    void shouldSyncBothWhenBothProvided() throws Exception {
        ProfileAvatarSyncRequest request = new ProfileAvatarSyncRequest("https://img.com/a.jpg", "John Doe");

        mockMvc.perform(post("/api/internal/profiles/{userId}/avatar", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted());

        verify(profileService).syncAvatarFromExternalIfEmpty(eq(userId), eq("https://img.com/a.jpg"), eq("John Doe"));
    }

    @Test
    void shouldReturn400WhenBothNullOrBlank() throws Exception {
        // Case 1: null body
        mockMvc.perform(post("/api/internal/profiles/{userId}/avatar", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("null"))
                .andExpect(status().isBadRequest());

        // Case 2: both blank
        ProfileAvatarSyncRequest request = new ProfileAvatarSyncRequest("  ", "  ");
        mockMvc.perform(post("/api/internal/profiles/{userId}/avatar", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(profileService);
    }
}