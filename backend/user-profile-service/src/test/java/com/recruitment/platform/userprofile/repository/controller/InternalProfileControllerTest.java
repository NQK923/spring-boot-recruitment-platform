package com.recruitment.platform.userprofile.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.platform.userprofile.dto.BatchUserIdsRequest;
import com.recruitment.platform.userprofile.dto.ProfileSummaryResponse;
import com.recruitment.platform.userprofile.service.ProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InternalProfileController.class)
class InternalProfileControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private ProfileService profileService;

    @Test
    void shouldReturnProfileSummaries() throws Exception {
        // Given
        List<ProfileSummaryResponse> summaries = List.of(
                new ProfileSummaryResponse(100L, "Nguyen Van A"),
                new ProfileSummaryResponse(200L, "Tran Thi B")
        );
        when(profileService.getProfilesInBatch(anyList())).thenReturn(summaries);

        BatchUserIdsRequest request = new BatchUserIdsRequest(List.of(100L, 200L));

        // When & Then
        mockMvc.perform(post("/api/internal/profiles/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].userId").value(100))
                .andExpect(jsonPath("$[0].fullName").value("Nguyen Van A"))
                .andExpect(jsonPath("$[1].userId").value(200));
    }

    @Test
    void shouldReturnEmptyListWhenNoIds() throws Exception {
        when(profileService.getProfilesInBatch(anyList())).thenReturn(List.of());

        BatchUserIdsRequest request = new BatchUserIdsRequest(List.of());

        mockMvc.perform(post("/api/internal/profiles/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void shouldReturn400WhenNullRequest() throws Exception {
        mockMvc.perform(post("/api/internal/profiles/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("null"))
                .andExpect(status().isBadRequest());
    }
}