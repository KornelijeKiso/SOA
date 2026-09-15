package com.example.gatewayservice.security;

import com.example.gatewayservice.config.CorsConfig;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.function.ServerRequest;

import javax.crypto.spec.SecretKeySpec;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;

class JwtAuthenticationFilterTests {
    private final String secret = UUID.randomUUID().toString() + UUID.randomUUID();
    private final SecretKeySpec key = new SecretKeySpec(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(secret);

    private String token(String subject, Object role, Date expiration) {
        return Jwts.builder().subject(subject).claim("role", role).expiration(expiration)
                .signWith(key, Jwts.SIG.HS256).compact();
    }

    private MockHttpServletRequest request(String method, String path, String token) {
        var request = new MockHttpServletRequest(method, path);
        request.addHeader("x-user-email", "attacker@example.com");
        request.addHeader("X-USER-ROLE", "ADMIN");
        if (token != null) request.addHeader("Authorization", "Bearer " + token);
        return request;
    }

    @Test
    void verifiedHeadersAreVisibleToMvcAndSpoofedValuesAreRemoved() throws Exception {
        for (String role : List.of("GUIDE", "TOURIST", "ADMIN")) {
            var request = request("GET", "/api/blogs/1", token("user@example.com", role, new Date(System.currentTimeMillis() + 60000)));
            var called = new AtomicBoolean();
            filter.doFilter(request, new MockHttpServletResponse(), (incoming, response) -> {
                called.set(true);
                var servlet = (HttpServletRequest) incoming;
                assertEquals(List.of("user@example.com"), Collections.list(servlet.getHeaders("x-user-email")));
                assertEquals(role, servlet.getHeader("x-user-role"));
                var mvc = ServerRequest.create(servlet, List.of());
                assertEquals("user@example.com", mvc.headers().firstHeader("X-User-Email"));
                assertEquals(role, mvc.headers().firstHeader("X-User-Role"));
                assertEquals(request.getHeader("Authorization"), mvc.headers().firstHeader("Authorization"));
            });
            assertTrue(called.get());
        }
    }

    @Test
    void rejectsInvalidTokensAndClaims() throws Exception {
        Date future = new Date(System.currentTimeMillis() + 60000);
        String wrongKey = Jwts.builder().subject("user@example.com").claim("role", "GUIDE")
                .expiration(future).signWith(Jwts.SIG.HS256.key().build()).compact();
        String wrongAlgorithm = Jwts.builder().subject("user@example.com").claim("role", "GUIDE")
                .expiration(future).signWith(new SecretKeySpec(key.getEncoded(), "HmacSHA512"), Jwts.SIG.HS512).compact();
        for (String value : List.of("", "garbage", wrongKey, wrongAlgorithm,
                token("user@example.com", "GUIDE", new Date(System.currentTimeMillis() - 60000)),
                token("user@example.com", "GUIDE", null),
                token(" ", "GUIDE", future),
                token(null, "GUIDE", future),
                token("user@example.com", null, future),
                token("user@example.com", "OWNER", future),
                token("user@example.com", 123, future))) {
            assertUnauthorized(request("GET", "/api/tours", value));
        }
        assertUnauthorized(request("GET", "/api/cart", null));
        var basic = request("GET", "/api/cart", null);
        basic.addHeader("Authorization", "Basic abc");
        assertUnauthorized(basic);
        var duplicate = request("GET", "/api/cart", token("user@example.com", "GUIDE", future));
        duplicate.addHeader("Authorization", "Bearer another");
        assertUnauthorized(duplicate);
    }

    private void assertUnauthorized(MockHttpServletRequest request) throws Exception {
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> fail("Unauthorized request reached downstream"));
        assertEquals(401, response.getStatus());
        assertEquals("{\"error\":\"Unauthorized\"}", response.getContentAsString());
        assertTrue(response.getContentType().startsWith("application/json"));
    }

    @Test
    void publicRequestsHaveNoClientIdentityAndOtherApiPathsAreProtected() throws Exception {
        for (String[] route : List.of(new String[]{"POST", "/api/auth/register"},
                new String[]{"POST", "/api/auth/login"}, new String[]{"OPTIONS", "/api/blogs"},
                new String[]{"GET", "/actuator/health"})) {
            var called = new AtomicBoolean();
            filter.doFilter(request(route[0], route[1], "invalid"), new MockHttpServletResponse(), (req, res) -> {
                called.set(true);
                var mvc = ServerRequest.create((HttpServletRequest) req, List.of());
                assertNull(mvc.headers().firstHeader("X-User-Email"));
                assertNull(mvc.headers().firstHeader("X-User-Role"));
            });
            assertTrue(called.get());
        }
        for (String path : List.of("/api", "/api/auth/login", "/api/auth/register",
                "/api/auth/other", "/api/profile", "/api/users", "/api/follow",
                "/api/positions", "/api/executions", "/api/unknown")) {
            assertUnauthorized(request("GET", path, null));
        }
    }

    @Test
    void corsHandlesPreflightAndAddsHeadersToUnauthorizedResponses() throws Exception {
        var cors = new CorsConfig().corsFilter("http://localhost:5173").getFilter();
        var preflight = request("OPTIONS", "/api/blogs", null);
        preflight.addHeader("Origin", "http://localhost:5173");
        preflight.addHeader("Access-Control-Request-Method", "POST");
        preflight.addHeader("Access-Control-Request-Headers", "Authorization,Content-Type");
        var response = new MockHttpServletResponse();
        cors.doFilter(preflight, response, (req, res) -> fail("Preflight should finish before JWT"));
        assertEquals(200, response.getStatus());
        assertEquals("http://localhost:5173", response.getHeader("Access-Control-Allow-Origin"));

        var actual = request("GET", "/api/blogs", null);
        actual.addHeader("Origin", "http://localhost:5173");
        var unauthorized = new MockHttpServletResponse();
        cors.doFilter(actual, unauthorized, (req, res) ->
                filter.doFilter(req, res, (a, b) -> fail("Missing JWT")));
        assertEquals(401, unauthorized.getStatus());
        assertEquals("http://localhost:5173", unauthorized.getHeader("Access-Control-Allow-Origin"));
    }
}
