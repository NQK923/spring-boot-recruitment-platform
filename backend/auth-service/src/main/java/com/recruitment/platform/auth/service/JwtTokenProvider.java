package com.recruitment.platform.auth.service;

import com.recruitment.platform.auth.client.CompanyServiceClient;
import com.recruitment.platform.auth.client.dto.CompanyMembershipResponse;
import com.recruitment.platform.auth.model.Role;
import com.recruitment.platform.auth.model.User;
import com.recruitment.platform.auth.repository.UserRepository;
import feign.FeignException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private int jwtExpirationInMs;

    private final UserRepository userRepository; // Inject UserRepository
    private final CompanyServiceClient companyServiceClient;

    public JwtTokenProvider(UserRepository userRepository,
                            CompanyServiceClient companyServiceClient) {
        this.userRepository = userRepository;
        this.companyServiceClient = companyServiceClient;
    }

    public String generateToken(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else if (principal instanceof String stringPrincipal) {
            username = stringPrincipal;
        } else {
            throw new IllegalStateException("Unsupported principal type: " + principal.getClass());
        }

        User user = userRepository.findByEmail(username).orElseThrow(); // Find user to get ID
        Long companyId = resolveCompanyId(user.getId());

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        var builder = Jwts.builder()
                .setSubject(Long.toString(user.getId())) // Use user ID as subject
                .claim("email", user.getEmail())
                .claim("roles", mapRoles(user))
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512);

        if (companyId != null) {
            builder.claim("companyId", companyId);
        }

        return builder.compact();
    }

    private List<String> mapRoles(User user) {
        return user.getRoles()
                .stream()
                .map(Role::getName)
                .collect(Collectors.toList());
    }

    private Long resolveCompanyId(Long userId) {
        try {
            CompanyMembershipResponse membership = companyServiceClient.getCompanyMembership(userId);
            if (membership == null || membership.getId() == null) {
                return null;
            }
            return membership.getId().getCompanyId();
        } catch (FeignException.NotFound notFound) {
            // User simply does not belong to a company (e.g., candidate or super admin)
            return null;
        } catch (Exception ex) {
            log.warn("Unable to resolve company for user {} while generating JWT: {}", userId, ex.getMessage());
            return null;
        }
    }
}
