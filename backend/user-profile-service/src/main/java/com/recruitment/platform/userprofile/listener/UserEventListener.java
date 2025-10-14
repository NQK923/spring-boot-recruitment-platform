package com.recruitment.platform.userprofile.listener;

import com.recruitment.platform.userprofile.event.UserRegisteredEvent;
import com.recruitment.platform.userprofile.service.ProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

@Component
public class UserEventListener {

    private static final Logger log = LoggerFactory.getLogger(UserEventListener.class);
    private final ProfileService profileService;

    public UserEventListener(ProfileService profileService) {
        this.profileService = profileService;
    }

    @Bean
    public Consumer<UserRegisteredEvent> userRegisteredEventConsumer() {
        return event -> {
            log.info("Received UserRegisteredEvent for user ID: {}", event.userId());
            profileService.createProfileForNewUser(event);
        };
    }
}
