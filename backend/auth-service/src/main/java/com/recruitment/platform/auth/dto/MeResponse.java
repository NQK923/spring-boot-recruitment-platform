package com.recruitment.platform.auth.dto;

import java.util.List;

public record MeResponse(Long id, String email, List<String> roles) {
}
