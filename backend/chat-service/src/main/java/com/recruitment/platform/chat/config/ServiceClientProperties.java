package com.recruitment.platform.chat.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Setter
@Getter
@ConfigurationProperties(prefix = "services")
public class ServiceClientProperties {

    /**
     * Gateway base URL để proxy các request nội bộ (ví dụ http://gateway-service:8080).
     */
    private String gatewayBaseUrl = "http://gateway-service:8080";

}
