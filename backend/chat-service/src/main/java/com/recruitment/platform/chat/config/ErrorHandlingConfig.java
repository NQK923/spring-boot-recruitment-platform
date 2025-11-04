package com.recruitment.platform.chat.config;

import com.recruitment.platform.chat.exception.ChatErrorAttributes;
import com.recruitment.platform.chat.exception.ChatErrorWebExceptionHandler;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.web.ErrorProperties;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.web.reactive.result.view.ViewResolver;

import java.util.List;

@Configuration
public class ErrorHandlingConfig {

    @Bean
    @Order(-2)
    public ChatErrorWebExceptionHandler chatErrorWebExceptionHandler(ErrorAttributes errorAttributes,
                                                                     WebProperties webProperties,
                                                                     ErrorProperties errorProperties,
                                                                     ApplicationContext applicationContext,
                                                                     ObjectProvider<ViewResolver> viewResolvers,
                                                                     ServerCodecConfigurer serverCodecConfigurer) {
        ChatErrorWebExceptionHandler exceptionHandler =
            new ChatErrorWebExceptionHandler(errorAttributes, webProperties.getResources(), errorProperties, applicationContext);
        List<ViewResolver> resolverList = viewResolvers.orderedStream().toList();
        exceptionHandler.setViewResolvers(resolverList);
        exceptionHandler.setMessageWriters(serverCodecConfigurer.getWriters());
        exceptionHandler.setMessageReaders(serverCodecConfigurer.getReaders());
        return exceptionHandler;
    }

    @Bean
    public WebProperties webProperties() {
        return new WebProperties();
    }

    @Bean
    public ErrorAttributes errorAttributes() {
        return new ChatErrorAttributes();
    }

    @Bean
    public ErrorProperties errorProperties() {
        return new ErrorProperties();
    }
}
