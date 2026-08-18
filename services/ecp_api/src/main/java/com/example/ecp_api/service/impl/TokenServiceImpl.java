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
    private static final String PRESENCE_PREFIX = "userPresence:";
    private static final long PRESENCE_TTL_MINUTES = 10;

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
    public String getEmailFromRefreshToken(String token) {
        return redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + token);
    }

    @Override
    public String getUsernameFromRefreshToken(String token) {
        return getEmailFromRefreshToken(token);
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

    @Override
    public void revokeUserTokens(String username) {
        if (!StringUtils.hasText(username)) return;

        clearUserPresence(username);

        java.util.Set<String> accessKeys = redisTemplate.keys(ACCESS_TOKEN_PREFIX + "*");
        if (accessKeys != null) {
            for (String key : accessKeys) {
                String val = redisTemplate.opsForValue().get(key);
                if (username.equalsIgnoreCase(val)) {
                    redisTemplate.delete(key);
                }
            }
        }

        java.util.Set<String> refreshKeys = redisTemplate.keys(REFRESH_TOKEN_PREFIX + "*");
        if (refreshKeys != null) {
            for (String key : refreshKeys) {
                String val = redisTemplate.opsForValue().get(key);
                if (username.equalsIgnoreCase(val)) {
                    redisTemplate.delete(key);
                }
            }
        }
    }

    @Override
    public void updateUserPresence(String username) {
        if (StringUtils.hasText(username)) {
            redisTemplate.opsForValue().set(
                    PRESENCE_PREFIX + username,
                    "online",
                    Duration.ofMinutes(PRESENCE_TTL_MINUTES)
            );
        }
    }

    @Override
    public boolean isUserOnline(String username) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(PRESENCE_PREFIX + username));
    }

    @Override
    public void clearUserPresence(String username) {
        if (StringUtils.hasText(username)) {
            redisTemplate.delete(PRESENCE_PREFIX + username);
        }
    }

    @Override
    public long countOnlineUsers() {
        java.util.Set<String> keys = redisTemplate.keys(PRESENCE_PREFIX + "*");
        return keys != null ? keys.size() : 0;
    }
}
