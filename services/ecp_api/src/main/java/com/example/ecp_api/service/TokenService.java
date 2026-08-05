package com.example.ecp_api.service;

public interface TokenService {
    void saveAccessToken(String token, String email, long expirationMs);
    void saveRefreshToken(String token, String email, long expirationMs);
    boolean validateAccessToken(String token);
    boolean validateRefreshToken(String token);
    String getEmailFromRefreshToken(String token);
    String getUsernameFromRefreshToken(String token);
    void deleteTokens(String accessToken, String refreshToken);
    void revokeUserTokens(String email);
    
    // Presence methods
    void updateUserPresence(String email);
    boolean isUserOnline(String email);
    void clearUserPresence(String email);
    long countOnlineUsers();
}
