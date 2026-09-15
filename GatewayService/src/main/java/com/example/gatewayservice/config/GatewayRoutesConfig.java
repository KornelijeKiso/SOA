package com.example.gatewayservice.config;

import org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouterFunction<ServerResponse> stakeholdersRoutes(@Value("${gateway.stakeholders-url}") String url) {
        return RouterFunctions.route()
                .route(RequestPredicates.path("/api/auth/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/profile/**"), HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri(url))
                .build();
    }
    @Bean
    public RouterFunction<ServerResponse> blogRoutes(@Value("${gateway.blogs-url}") String url) {
        return RouterFunctions.route()
                .route(RequestPredicates.path("/api/blogs/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/users/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/follow"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/follow/**"), HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri(url))
                .build();
    }
    @Bean
    public RouterFunction<ServerResponse> tourRoutes(@Value("${gateway.tours-url}") String url) {
        return RouterFunctions.route()
                .route(RequestPredicates.path("/api/tours/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/positions/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/cart/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/executions/**"), HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri(url))
                .build();
    }
}