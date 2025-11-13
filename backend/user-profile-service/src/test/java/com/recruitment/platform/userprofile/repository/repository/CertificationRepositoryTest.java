package com.recruitment.platform.userprofile.repository.service;

import com.recruitment.platform.userprofile.model.Certification;
import com.recruitment.platform.userprofile.model.Profile;
import com.recruitment.platform.userprofile.repository.CertificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest // Chỉ load JPA components (repository, entity, etc.)
class CertificationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CertificationRepository certificationRepository;

    private Profile profile;
    private Certification cert1;
    private Certification cert2;
    private Certification certOther;

    @BeforeEach
    void setUp() {
        // Tạo Profile
        profile = new Profile();
        profile.setUserId(100L); // giả sử Profile có field userId
        entityManager.persist(profile);
        entityManager.flush();

        // Tạo Certification cho profile này
        cert1 = new Certification();
        cert1.setProfile(profile);
        cert1.setName("AWS Certified Solutions Architect");
        cert1.setIssuer("Amazon Web Services");
        cert1.setIssueDate(LocalDate.of(2023, 1, 15));
        cert1.setCredentialId("AWS-12345");
        entityManager.persist(cert1);

        cert2 = new Certification();
        cert2.setProfile(profile);
        cert2.setName("Google Cloud Professional Architect");
        cert2.setIssuer("Google Cloud");
        cert2.setIssueDate(LocalDate.of(2024, 5, 20));
        entityManager.persist(cert2);

        // Certification của user khác
        Profile otherProfile = new Profile();
        otherProfile.setUserId(200L);
        entityManager.persist(otherProfile);

        certOther = new Certification();
        certOther.setProfile(otherProfile);
        certOther.setName("Microsoft Azure Fundamentals");
        certOther.setIssuer("Microsoft");
        entityManager.persist(certOther);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should find all certifications by userId")
    void shouldFindCertificationsByUserId() {
        // When
        List<Certification> found = certificationRepository.findByProfile_UserId(100L);

        // Then
        assertThat(found).hasSize(2);
        assertThat(found).extracting(Certification::getName)
                .containsExactlyInAnyOrder(
                        "AWS Certified Solutions Architect",
                        "Google Cloud Professional Architect"
                );
    }

    @Test
    @DisplayName("Should return empty list when no certifications for userId")
    void shouldReturnEmptyListWhenNoCertifications() {
        // When
        List<Certification> found = certificationRepository.findByProfile_UserId(999L);

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should find certification by id and userId")
    void shouldFindCertificationByIdAndUserId() {
        // When
        Optional<Certification> found = certificationRepository.findByIdAndProfile_UserId(cert1.getId(), 100L);

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("AWS Certified Solutions Architect");
    }

    @Test
    @DisplayName("Should not find certification when id belongs to another user")
    void shouldNotFindWhenIdBelongsToAnotherUser() {
        // When
        Optional<Certification> found = certificationRepository.findByIdAndProfile_UserId(certOther.getId(), 100L);

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should not find certification when id does not exist")
    void shouldNotFindWhenIdDoesNotExist() {
        // When
        Optional<Certification> found = certificationRepository.findByIdAndProfile_UserId(9999L, 100L);

        // Then
        assertThat(found).isEmpty();
    }
}