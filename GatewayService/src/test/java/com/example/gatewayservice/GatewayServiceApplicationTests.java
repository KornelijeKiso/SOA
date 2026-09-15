package com.example.gatewayservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class GatewayServiceApplicationTests {

    @org.springframework.test.context.DynamicPropertySource
    static void jwtProperties(org.springframework.test.context.DynamicPropertyRegistry registry) {
        registry.add("jwt.secret", () -> java.util.UUID.randomUUID().toString() + java.util.UUID.randomUUID());
    }

    @Test
    void contextLoads() {
    }

}
