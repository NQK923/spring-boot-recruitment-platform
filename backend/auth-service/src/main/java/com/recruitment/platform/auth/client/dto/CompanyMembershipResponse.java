package com.recruitment.platform.auth.client.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * Lightweight projection of a company membership returned by company-service.
 * Implemented as simple POJOs instead of records for wider IDE/tooling compatibility.
 */
@Setter
@Getter
public class CompanyMembershipResponse {
    private CompanyMembershipResponseId id;
    private String role;
    private boolean locked;

    public CompanyMembershipResponse() {
    }

    public CompanyMembershipResponse(CompanyMembershipResponseId id, String role) {
        this(id, role, false);
    }

    public CompanyMembershipResponse(CompanyMembershipResponseId id, String role, boolean locked) {
        this.id = id;
        this.role = role;
        this.locked = locked;
    }

    @Setter
    @Getter
    public static class CompanyMembershipResponseId implements Serializable {
        private Long companyId;
        private Long userId;

        public CompanyMembershipResponseId() {
        }

        public CompanyMembershipResponseId(Long companyId, Long userId) {
            this.companyId = companyId;
            this.userId = userId;
        }

    }
}
