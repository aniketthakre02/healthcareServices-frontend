package com.project.HealthcareService.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsServicesImpl userDetailsServices;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();

        // Skip JWT processing for public endpoints
        if (path.equals("/api/auth/register") || path.equals("/api/auth/login") ||
            path.equals("/actuator/health") || path.startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (header != null && header.toLowerCase().startsWith("bearer ")) {
            token = header.substring(7).trim();
            if (!token.isEmpty()) {
                try {
                    email = jwtUtil.extractEmail(token);
                } catch (Exception e) {
                    // Invalid token - let request continue without authentication
                    // Security will block authenticated endpoints
                    logger.warn("Invalid JWT token: " + e.getMessage());
                }
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsServices.loadUserByUsername(email);
                if (jwtUtil.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken auth = new
                            UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    logger.warn("JWT validation failed for user: " + email);
                }
            } catch (Exception e) {
                logger.warn("Failed to set authentication for user: " + email + " - " + e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}
