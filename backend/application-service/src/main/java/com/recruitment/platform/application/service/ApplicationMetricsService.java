package com.recruitment.platform.application.service;

import com.recruitment.platform.application.dto.ApplicationMetricsRequest;
import com.recruitment.platform.application.dto.ApplicationMetricsResponse;
import com.recruitment.platform.application.dto.ApplicationMetricsSummaryResponse;
import com.recruitment.platform.application.dto.ApplicationStatusAggregation;
import com.recruitment.platform.application.model.ApplicationStatus;
import com.recruitment.platform.application.repository.ApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ApplicationMetricsService {

    private final ApplicationRepository applicationRepository;

    public ApplicationMetricsService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public ApplicationMetricsSummaryResponse getSummary() {
        List<ApplicationStatusAggregation> aggregations = applicationRepository.aggregateByStatus();
        Map<String, Long> byStatus = mapAggregations(aggregations);
        long total = aggregations.stream().mapToLong(ApplicationStatusAggregation::count).sum();
        return new ApplicationMetricsSummaryResponse(total, byStatus);
    }

    public ApplicationMetricsResponse getMetrics(ApplicationMetricsRequest request) {
        List<Long> jobIds = request.jobPostingIds();
        if (jobIds == null || jobIds.isEmpty()) {
            return new ApplicationMetricsResponse(0L, Map.of());
        }
        List<ApplicationStatusAggregation> aggregations =
                applicationRepository.aggregateByStatusForJobIds(jobIds);
        Map<String, Long> byStatus = mapAggregations(aggregations);
        long total = aggregations.stream().mapToLong(ApplicationStatusAggregation::count).sum();
        return new ApplicationMetricsResponse(total, byStatus);
    }

    private Map<String, Long> mapAggregations(List<ApplicationStatusAggregation> aggregations) {
        Map<ApplicationStatus, Long> map = new EnumMap<>(ApplicationStatus.class);
        aggregations.forEach(agg -> map.merge(agg.status(), agg.count(), Long::sum));
        return map.entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> entry.getKey().name().toLowerCase(Locale.ROOT),
                        Map.Entry::getValue));
    }
}
