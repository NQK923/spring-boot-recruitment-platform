package com.recruitment.platform.userprofile.repository;

import com.recruitment.platform.userprofile.model.Profile;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ProfileRepositoryTest {

    @Autowired
    private ProfileRepository profileRepository;

    @Test
    void shouldFindProfilesByUserIdIn() {
        // Given
        Profile p1 = new Profile(); p1.setUserId(100L); p1.setFullName("A");
        Profile p2 = new Profile(); p2.setUserId(200L); p2.setFullName("B");
        Profile p3 = new Profile(); p3.setUserId(300L); p3.setFullName("C");
        profileRepository.saveAll(List.of(p1, p2, p3));

        // When
        List<Profile> found = profileRepository.findByUserIdIn(List.of(100L, 300L));

        // Then
        assertThat(found)
                .hasSize(2)
                .extracting(Profile::getUserId)
                .containsExactlyInAnyOrder(100L, 300L);
    }

    @Test
    void shouldReturnEmptyWhenNoMatch() {
        List<Profile> found = profileRepository.findByUserIdIn(List.of(999L));
        assertThat(found).isEmpty();
    }
}