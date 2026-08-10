package com.recruitflow.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.http.HttpMethod;

import javax.crypto.SecretKey;
import java.util.List;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/auth/register", "/api/auth/login"
    );

    private final SecretKey key = Keys.hmacShaKeyFor(
            "replace-this-with-a-long-random-string-min-32-chars".getBytes());

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (request.getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        if (OPEN_ENDPOINTS.stream().anyMatch(path::startsWith)) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }

        Claims claims;
        try {
            claims = Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(authHeader.substring(7)).getBody();
        } catch (Exception e) {
            return unauthorized(exchange);
        }

        // Any path containing an /admin/ segment (e.g. /api/auth/admin/users,
        // /api/jobs/admin/all) requires the ADMIN role, regardless of which
        // downstream service owns it. Checked here so a non-admin token can
        // never reach an admin endpoint, even if a service forgets to check.
        if (path.contains("/admin/")) {
            String role = claims.get("role", String.class);
            if (!"ADMIN".equals(role)) {
                return forbidden(exchange);
            }
        }

        return chain.filter(exchange);
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    private Mono<Void> forbidden(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() { return -1; }
}