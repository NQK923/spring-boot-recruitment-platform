package com.recruitment.platform.userprofile.controller;

import com.recruitment.platform.userprofile.dto.ProfileMetricsResponse;
import com.recruitment.platform.userprofile.service.ProfileMetricsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProfileMetricsController.class)
class ProfileMetricsControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private ProfileMetricsService profileMetricsService;

    @Test
    void shouldReturnMetricsSummary() throws Exception {
        ProfileMetricsResponse response = new ProfileMetricsResponse(
                1500L,      // totalProfiles
                1200L,      // withCv
                800L,       // withAvatar
                95.5        // completionRate
        );

        when(profileMetricsService.getSummary()).thenReturn(response);

        mockMvc.perform(get("/api/internal/profiles/metrics/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProfiles").value(1500))
                .andExpect(jsonPath("$.profilesWithCv").value(1200))
                .andExpect(jsonPath("$.profilesWithAvatar").value(800))
                .andExpect(jsonPath("$.averageCompletionRate").value(95.5));
    }
}