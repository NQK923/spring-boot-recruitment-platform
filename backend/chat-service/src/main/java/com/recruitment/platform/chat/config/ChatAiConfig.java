package com.recruitment.platform.chat.config;

import com.recruitment.platform.chat.client.GeminiClient;
import com.recruitment.platform.chat.prompt.SystemPromptProvider;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatAiConfig {

    @Bean
    public ChatClient chatClient(GeminiClient geminiClient,
                                 GeminiProperties geminiProperties,
                                 SystemPromptProvider systemPromptProvider) {
        ChatOptions defaultOptions = ChatOptions.builder()
            .model(geminiProperties.getModel())
            .temperature(geminiProperties.getTemperature())
            .topP(geminiProperties.getTopP())
            .maxTokens(geminiProperties.getMaxTokens())
            .build();

        return ChatClient.builder(geminiClient)
            .defaultOptions(defaultOptions)
            .defaultSystem(systemPromptProvider.getPrompt())
            .build();
    }
}
