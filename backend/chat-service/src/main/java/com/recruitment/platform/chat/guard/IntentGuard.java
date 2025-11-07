package com.recruitment.platform.chat.guard;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class IntentGuard {

    private static final String WHITELIST_PATTERN =
        "(?i)\\b(job|việc|tuyển|tuyển dụng|ứng tuyển|nộp cv|hồ sơ|jd|mô tả công việc|phỏng vấn|interview|offer|lương|benefit|phúc lợi|thử việc|thời gian làm việc|trạng thái hồ sơ|liên hệ hr|hr|recruiter|career|careers|candidate portal|on-site|remote|hybrid|cover letter)\\b";

    private static final String RECOMMEND_PATTERN =
        "(?i)\\b(gợi ý|phù hợp|tìm|suggest|recommend|backend|frontend|fullstack|java|node|react|data|qa|tester|devops|lương|mức lương|địa điểm|remote|onsite|hybrid)\\b";

    private static final Pattern PATTERN = Pattern.compile(WHITELIST_PATTERN);
    private static final Pattern RECOMMEND_INTENT = Pattern.compile(RECOMMEND_PATTERN);

    public boolean isAllowed(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }
        return PATTERN.matcher(text).find();
    }

    public boolean isRecommendationIntent(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }
        return RECOMMEND_INTENT.matcher(text).find();
    }
}
