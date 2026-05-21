package com.example.ecp_api.security;

import com.example.ecp_api.config.JwtProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.getSecret()));
    }

    public String generateAccessToken(Authentication authentication) {
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();
        return generateToken(userPrincipal, jwtProperties.getExpiration());
    }

    public String generateAccessToken(CustomUserDetails userDetails) {
        return generateToken(userDetails, jwtProperties.getExpiration());
    }

    public String generateRefreshToken(Authentication authentication) {
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();
        return generateToken(userPrincipal, jwtProperties.getRefreshExpiration());
    }

    public String generateRefreshToken(CustomUserDetails userDetails) {
        return generateToken(userDetails, jwtProperties.getRefreshExpiration());
    }

    private String generateToken(CustomUserDetails userDetails, long expirationMs) {
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("id", userDetails.getId().toString())
                .claim("email", userDetails.getEmail())
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + expirationMs))
                .signWith(key())
                .compact();
    }

    public Claims getClaimsFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsernameFromJwtToken(String token) {
        return getClaimsFromJwtToken(token).getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    public long getJwtExpirationMs() {
        return jwtProperties.getExpiration();
    }

    public long getRefreshExpirationMs() {
        return jwtProperties.getRefreshExpiration();
    }
}
