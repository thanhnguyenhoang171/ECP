package com.example.ecp_api.service;

public interface TokenService {
    void saveAccessToken(String token, String username, long expirationMs);
    void saveRefreshToken(String token, String username, long expirationMs);
    boolean validateAccessToken(String token);
    boolean validateRefreshToken(String token);
    String getUsernameFromRefreshToken(String token);
    void deleteTokens(String accessToken, String refreshToken);
}
