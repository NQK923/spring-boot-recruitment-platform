package com.recruitment.platform.userprofile.dto;

import java.util.List;

// Using a record for the update DTO. Add any other fields that can be updated.
public record UpdateProfileRequest(
    String fullName,
    String phoneNumber,
    String summary
) {}
