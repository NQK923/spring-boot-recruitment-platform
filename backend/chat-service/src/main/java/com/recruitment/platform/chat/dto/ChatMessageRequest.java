package com.recruitment.platform.chat.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Collections;
import java.util.List;

@Getter
@Setter
public class ChatMessageRequest {

    @Valid
    @Size(max = 4, message = "A maximum of 4 messages can be sent for context.")
    private List<ChatHistoryMessage> messages = Collections.emptyList();

    @NotNull
    @Pattern(regexp = "^(vi|en)$", message = "Language must be either 'vi' or 'en'.")
    private String language;

    private Long companyId;

    private boolean stream = false;

    public void setMessages(List<ChatHistoryMessage> messages) {
        this.messages = messages == null ? Collections.emptyList() : messages;
    }

    @AssertTrue(message = "At least one user message is required.")
    public boolean hasUserMessage() {
        if (messages == null || messages.isEmpty()) {
            return false;
        }
        return messages.stream().anyMatch(msg -> "user".equals(msg.role()));
    }
}
