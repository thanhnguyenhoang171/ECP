package com.example.ecp_api.service;

public interface EmailVerificationService {
    void sendVerificationOtp(String email);
    void verifyEmail(String email, String otpCode);
}
