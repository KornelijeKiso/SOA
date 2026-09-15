package com.example.gatewayservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final String EMAIL = "X-User-Email";
    private static final String ROLE = "X-User-Role";
    private static final Set<String> ROLES = Set.of("GUIDE", "TOURIST", "ADMIN");
    private final JwtParser parser;

    public JwtAuthenticationFilter(String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secret.isBlank() || bytes.length < 32) {
            throw new IllegalArgumentException("jwt.secret must contain at least 32 UTF-8 bytes");
        }
        parser = Jwts.parser()
                .verifyWith(new SecretKeySpec(bytes, "HmacSHA256"))
                .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        IdentityRequest sanitized = new IdentityRequest(request);
        String path = request.getRequestURI().substring(request.getContextPath().length());
        boolean publicRequest = "OPTIONS".equals(request.getMethod())
                || ("POST".equals(request.getMethod())
                    && ("/api/auth/register".equals(path) || "/api/auth/login".equals(path)))
                || ("GET".equals(request.getMethod()) && "/actuator/health".equals(path));
        if (publicRequest || !(path.equals("/api") || path.startsWith("/api/"))) {
            chain.doFilter(sanitized, response);
            return;
        }

        Enumeration<String> headers = sanitized.getHeaders("Authorization");
        String authorization = headers.hasMoreElements() ? headers.nextElement() : null;
        if (authorization == null || headers.hasMoreElements()
                || !authorization.regionMatches(true, 0, "Bearer ", 0, 7)
                || authorization.length() <= 7) {
            unauthorized(response);
            return;
        }

        try {
            var signed = parser.parseSignedClaims(authorization.substring(7));
            if (!"HS256".equals(signed.getHeader().getAlgorithm())) {
                unauthorized(response);
                return;
            }
            Claims claims = signed.getPayload();
            String email = claims.getSubject();
            String role = claims.get("role", String.class);
            if (claims.getExpiration() == null || email == null || email.isBlank()
                    || email.chars().anyMatch(c -> c < 32 || c == 127)
                    || role == null || !ROLES.contains(role)) {
                unauthorized(response);
                return;
            }
            sanitized.identity.put(EMAIL, email);
            sanitized.identity.put(ROLE, role);
        } catch (JwtException | IllegalArgumentException e) {
            unauthorized(response);
            return;
        }
        chain.doFilter(sanitized, response);
    }

    private static void unauthorized(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"error\":\"Unauthorized\"}");
    }

    private static final class IdentityRequest extends HttpServletRequestWrapper {
        private final Map<String, String> identity = new LinkedHashMap<>();

        private IdentityRequest(HttpServletRequest request) {
            super(request);
        }

        private static boolean identityHeader(String name) {
            return EMAIL.equalsIgnoreCase(name) || ROLE.equalsIgnoreCase(name);
        }

        @Override
        public String getHeader(String name) {
            if (identityHeader(name)) {
                return identity.get(EMAIL.equalsIgnoreCase(name) ? EMAIL : ROLE);
            }
            return super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            if (identityHeader(name)) {
                String value = getHeader(name);
                return Collections.enumeration(value == null ? Collections.emptyList() : Collections.singletonList(value));
            }
            return super.getHeaders(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            var names = Collections.list(super.getHeaderNames());
            names.removeIf(IdentityRequest::identityHeader);
            names.addAll(identity.keySet());
            return Collections.enumeration(names);
        }
    }
}
