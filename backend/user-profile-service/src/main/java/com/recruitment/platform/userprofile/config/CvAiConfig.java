package com.recruitment.platform.userprofile.config;

import com.recruitment.platform.userprofile.service.cv.ai.GeminiCvChatModel;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CvAiConfig {

    @Bean
    public ChatClient cvChatClient(GeminiCvChatModel chatModel, GeminiProperties properties) {
        ChatOptions defaultOptions = ChatOptions.builder()
            .model(properties.modelName())
            .temperature(properties.getTemperature())
            .topP(properties.getTopP())
            .topK(properties.getTopK())
            .build();

        return ChatClient.builder(chatModel)
            .defaultOptions(defaultOptions)
            .build();
    }
}
