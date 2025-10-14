package com.recruitment.platform.company.service;

import com.recruitment.platform.company.client.AuthServiceClient;
import com.recruitment.platform.company.client.dto.InternalInviteRequest;
import com.recruitment.platform.company.dto.UserInviteRequest;
import org.springframework.stereotype.Service;

@Service
public class CompanyService {

    private final AuthServiceClient authServiceClient;

    public CompanyService(AuthServiceClient authServiceClient) {
        this.authServiceClient = authServiceClient;
    }

    public void inviteUser(Long companyId, UserInviteRequest inviteRequest) {
        // In a real app, you'd add more logic here:
        // 1. Verify the company exists (companyRepository.existsById(companyId)).
        // 2. Verify the calling user has permission to invite to this specific company.

        InternalInviteRequest internalRequest = new InternalInviteRequest(
                inviteRequest.email(),
                inviteRequest.role(),
                companyId
        );
        authServiceClient.createInvitation(internalRequest);
    }
}
