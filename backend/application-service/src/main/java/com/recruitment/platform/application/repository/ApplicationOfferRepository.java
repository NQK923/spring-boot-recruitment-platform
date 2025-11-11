package com.recruitment.platform.application.repository;

import com.recruitment.platform.application.model.ApplicationOffer;
import com.recruitment.platform.application.model.ApplicationOfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicationOfferRepository extends JpaRepository<ApplicationOffer, Long> {
    Optional<ApplicationOffer> findByApplicationId(Long applicationId);

    long countByApplicationIdAndStatus(Long applicationId, ApplicationOfferStatus status);
}
