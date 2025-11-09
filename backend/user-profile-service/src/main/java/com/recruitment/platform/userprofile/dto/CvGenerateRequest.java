package com.recruitment.platform.userprofile.dto;

import lombok.Data;

@Data
public class CvGenerateRequest {
    private String templateCode;
    private String language;
    private String tone;
}
