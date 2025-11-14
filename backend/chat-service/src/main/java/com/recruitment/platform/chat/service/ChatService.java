package com.recruitment.platform.chat.service;

import com.recruitment.platform.chat.dto.ChatHistoryMessage;
import com.recruitment.platform.chat.model.ChatLanguage;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {

    private final ChatClient chatClient;

    public ChatService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    public Mono<String> generateResponse(List<ChatHistoryMessage> messages, ChatLanguage language) {
        Prompt prompt = new Prompt(buildMessages(messages, language));
        return Mono.fromCallable(() -> chatClient.prompt(prompt).call().content())
            .subscribeOn(Schedulers.boundedElastic())
            .defaultIfEmpty("");
    }

    public Flux<String> streamResponse(List<ChatHistoryMessage> messages, ChatHistoryMessage currentQuestion, ChatLanguage language) {
        List<ChatHistoryMessage> consolidated = messages != null ? new ArrayList<>(messages) : new ArrayList<>();
        if (currentQuestion != null) {
            consolidated.add(currentQuestion);
        }
        Prompt prompt = new Prompt(buildMessages(consolidated, language));
        return chatClient.prompt(prompt).stream().content();
    }

    private List<Message> buildMessages(List<ChatHistoryMessage> history, ChatLanguage language) {
        if (history == null || history.isEmpty()) {
            List<Message> defaults = new ArrayList<>();
            defaults.add(new UserMessage("Chào bạn!"));
            if (language == ChatLanguage.EN) {
                defaults.add(new UserMessage("Please respond in English."));
            }
            return defaults;
        }

        List<Message> messages = new ArrayList<>();
        history.stream()
            .map(this::normalize)
            .map(this::toMessage)
            .forEach(messages::add);

        if (language == ChatLanguage.EN) {
            messages.add(new UserMessage("Please respond in English."));
        }

        return messages;
    }

    private ChatHistoryMessage normalize(ChatHistoryMessage message) {
        if (message == null) {
            return new ChatHistoryMessage("user", "");
        }
        String role = "assistant".equals(message.role()) || "model".equals(message.role()) ? "assistant" : "user";
        return new ChatHistoryMessage(role, message.content());
    }

    private Message toMessage(ChatHistoryMessage message) {
        String content = message.content() == null ? "" : message.content();
        if ("assistant".equals(message.role())) {
            return new AssistantMessage(content);
        }
        return new UserMessage(content);
    }
}
