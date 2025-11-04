package com.recruitment.platform.chat.service;

import com.recruitment.platform.chat.client.GeminiClient;
import com.recruitment.platform.chat.dto.ChatHistoryMessage;
import com.recruitment.platform.chat.model.ChatLanguage;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ChatService {

    private final GeminiClient geminiClient;

    public ChatService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    public Mono<String> generateResponse(List<ChatHistoryMessage> messages, ChatLanguage language) {
        List<GeminiClient.GeminiContent> contents = buildContents(messages, language);
        return geminiClient.generateContent(contents)
            .defaultIfEmpty("");
    }

    public Flux<String> streamResponse(List<ChatHistoryMessage> messages, ChatHistoryMessage currentQuestion, ChatLanguage language) {
        List<ChatHistoryMessage> consolidated = new ArrayList<>(messages);
        if (currentQuestion != null) {
            consolidated.add(currentQuestion);
        }
        List<GeminiClient.GeminiContent> contents = buildContents(consolidated, language);
        return geminiClient.streamContent(contents);
    }

    private List<GeminiClient.GeminiContent> buildContents(List<ChatHistoryMessage> history, ChatLanguage language) {
        if (history == null || history.isEmpty()) {
            return Collections.singletonList(asContent("user", "Chào bạn!"));
        }
        List<GeminiClient.GeminiContent> contents = new ArrayList<>();
        history.stream()
            .map(this::normalize)
            .map(message -> asContent(message.role(), message.content()))
            .forEach(contents::add);

        if (language == ChatLanguage.EN) {
            contents.add(asContent("user", "Please respond in English."));
        }

        return contents;
    }

    private ChatHistoryMessage normalize(ChatHistoryMessage message) {
        if (message == null) {
            return new ChatHistoryMessage("user", "");
        }
        String role = "assistant".equals(message.role()) || "model".equals(message.role()) ? "model" : "user";
        return new ChatHistoryMessage(role, message.content());
    }

    private GeminiClient.GeminiContent asContent(String role, String text) {
        return new GeminiClient.GeminiContent(
            role,
            Collections.singletonList(new GeminiClient.GeminiPart(text == null ? "" : text))
        );
    }
}
