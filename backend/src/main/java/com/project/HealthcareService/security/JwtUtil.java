package com.project.HealthcareService.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {
    private final SecretKey key;
    private final long validityMs;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.token.validity:3600000}") long validityMs) {
        this.validityMs = validityMs;
        this.key = buildKey(secret);
    }

    private SecretKey buildKey(String secret) {
        // Try to decode as Base64, fallback to raw bytes padded to 256 bits
        try {
            byte[] decoded = Base64.getDecoder().decode(secret);
            if (decoded.length >= 32) {
                return Keys.hmacShaKeyFor(decoded);
            }
        } catch (IllegalArgumentException ignored) {
            // not base64, use raw
        }
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        // Ensure at least 32 bytes for HS256
        if (bytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(bytes, 0, padded, 0, bytes.length);
            // fill remainder with repeat
            for (int i = bytes.length; i < 32; i++) padded[i] = bytes[i % bytes.length];
            bytes = padded;
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    public String generateToken(String email, String userName, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("name", userName)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + validityMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public boolean isTokenExpired(String token) {
        try {
            return extractAllClaims(token).getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String email = extractEmail(token);
            return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Claims parseToken(String token) {
        return extractAllClaims(token);
    }
}
