package com.recruitment.platform.chat.exception;

import com.recruitment.platform.common.exception.ApiError;
import com.recruitment.platform.common.exception.ValidationError;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.boot.autoconfigure.web.reactive.error.DefaultErrorWebExceptionHandler;
import org.springframework.boot.autoconfigure.web.ErrorProperties;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;

import java.util.List;
import java.util.Map;

import reactor.core.publisher.Mono;

public class ChatErrorWebExceptionHandler extends DefaultErrorWebExceptionHandler {

    public ChatErrorWebExceptionHandler(ErrorAttributes errorAttributes,
                                        WebProperties.Resources resources,
                                        ErrorProperties errorProperties,
                                        ApplicationContext applicationContext) {
        super(errorAttributes, resources, errorProperties, applicationContext);
    }

    @Override
    protected RouterFunction<ServerResponse> getRoutingFunction(ErrorAttributes errorAttributes) {
        return RouterFunctions.route(RequestPredicates.all(), this::renderErrorResponse);
    }

    @Override
    protected Mono<ServerResponse> renderErrorResponse(ServerRequest request) {
        Map<String, Object> attributes = getErrorAttributes(request, ErrorAttributeOptions.defaults());
        HttpStatus status = HttpStatus.resolve((Integer) attributes.getOrDefault("status", 500));
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        List<?> rawViolations = (List<?>) attributes.getOrDefault("violations", List.of());
        List<ValidationError> violations = rawViolations.stream()
            .filter(ValidationError.class::isInstance)
            .map(ValidationError.class::cast)
            .toList();
        ApiError body = ApiError.of(
            status,
            (String) attributes.getOrDefault("message", status.getReasonPhrase()),
            (String) attributes.getOrDefault("path", request.path()),
            (String) attributes.getOrDefault("traceId", null),
            (Map<String, Object>) attributes.getOrDefault("details", Map.of()),
            violations
        );

        return ServerResponse.status(status)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body);
    }
}
