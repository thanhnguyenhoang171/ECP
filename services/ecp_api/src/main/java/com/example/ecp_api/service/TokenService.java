package com.example.ecp_api.service;

public interface TokenService {
    void saveAccessToken(String token, String username, long expirationMs);
    void saveRefreshToken(String token, String username, long expirationMs);
    boolean validateAccessToken(String token);
    boolean validateRefreshToken(String token);
    String getUsernameFromRefreshToken(String token);
    void deleteTokens(String accessToken, String refreshToken);
    
    // Presence methods
    void updateUserPresence(String username);
    boolean isUserOnline(String username);
    void clearUserPresence(String username);
    long countOnlineUsers();
}
