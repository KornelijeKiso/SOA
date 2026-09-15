package com.example.gatewayservice.config;

import org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouterFunction<ServerResponse> stakeholdersRoutes() {
        return RouterFunctions.route()
                .route(RequestPredicates.path("/api/auth/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/profile/**"), HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri("http://localhost:8081"))
                //.before(BeforeFilterFunctions.uri("http://stakeholders:8081"))
                .build();
    }
    @Bean
    public RouterFunction<ServerResponse> blogRoutes() {
        return RouterFunctions.route()
                .route(RequestPredicates.path("/api/blogs/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/users/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/follow"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/follow/**"), HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri("http://localhost:8082"))
                //.before(BeforeFilterFunctions.uri("http://blogs:8082"))
                .build();
    }
    @Bean
    public RouterFunction<ServerResponse> tourRoutes() {
        return RouterFunctions.route()
                .route(RequestPredicates.path("/api/tours/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/positions/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/cart/**"), HandlerFunctions.http())
                .route(RequestPredicates.path("/api/executions/**"), HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri("http://localhost:5281"))
                //.before(BeforeFilterFunctions.uri("http://tourservice:5281"))
                .build();
    }
}