package com.recruitment.platform.chat.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "services")
public class ServiceClientProperties {

    /**
     * Gateway base URL để proxy các request nội bộ (ví dụ http://gateway-service:8080).
     */
    private String gatewayBaseUrl = "http://gateway-service:8080";

    public String getGatewayBaseUrl() {
        return gatewayBaseUrl;
    }

    public void setGatewayBaseUrl(String gatewayBaseUrl) {
        this.gatewayBaseUrl = gatewayBaseUrl;
    }
}
