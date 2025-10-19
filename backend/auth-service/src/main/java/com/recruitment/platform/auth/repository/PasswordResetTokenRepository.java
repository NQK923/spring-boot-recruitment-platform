package com.recruitment.platform.auth.repository;

import com.recruitment.platform.auth.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUserIdAndToken(Long userId, String token);

    void deleteByUserId(Long userId);
}
