package com.example.ecp_api.service.impl;

import com.example.ecp_api.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String ACCESS_TOKEN_PREFIX = "accessToken:";
    private static final String REFRESH_TOKEN_PREFIX = "refreshToken:";

    @Override
    public void saveAccessToken(String token, String username, long expirationMs) {
        redisTemplate.opsForValue().set(
                ACCESS_TOKEN_PREFIX + token, 
                username, 
                Duration.ofMillis(expirationMs)
        );
    }

    @Override
    public void saveRefreshToken(String token, String username, long expirationMs) {
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + token, 
                username, 
                Duration.ofMillis(expirationMs)
        );
    }

    @Override
    public boolean validateAccessToken(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(ACCESS_TOKEN_PREFIX + token));
    }

    @Override
    public boolean validateRefreshToken(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(REFRESH_TOKEN_PREFIX + token));
    }

    @Override
    public String getUsernameFromRefreshToken(String token) {
        return redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + token);
    }

    @Override
    public void deleteTokens(String accessToken, String refreshToken) {
        if (StringUtils.hasText(accessToken)) {
            redisTemplate.delete(ACCESS_TOKEN_PREFIX + accessToken);
        }
        if (StringUtils.hasText(refreshToken)) {
            redisTemplate.delete(REFRESH_TOKEN_PREFIX + refreshToken);
        }
    }
}
