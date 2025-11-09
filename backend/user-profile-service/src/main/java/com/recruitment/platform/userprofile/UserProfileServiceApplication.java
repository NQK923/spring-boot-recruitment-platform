package com.recruitment.platform.userprofile;

import com.recruitment.platform.common.exception.GlobalExceptionHandler;
import com.recruitment.platform.userprofile.config.CvProperties;
import com.recruitment.platform.userprofile.config.GeminiProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@Import(GlobalExceptionHandler.class)
@EnableConfigurationProperties({GeminiProperties.class, CvProperties.class})
public class UserProfileServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserProfileServiceApplication.class, args);
    }
}
