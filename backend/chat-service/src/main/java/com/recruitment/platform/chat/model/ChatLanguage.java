package com.recruitment.platform.chat.model;

import lombok.Getter;

import java.util.Locale;

@Getter
public enum ChatLanguage {
    VI("vi"),
    EN("en");

    private final String code;

    ChatLanguage(String code) {
        this.code = code;
    }

    public static ChatLanguage fromCode(String code) {
        if (code == null) {
            return VI;
        }
        String normalized = code.trim().toLowerCase(Locale.ROOT);
        for (ChatLanguage language : values()) {
            if (language.code.equals(normalized)) {
                return language;
            }
        }
        return VI;
    }
}
