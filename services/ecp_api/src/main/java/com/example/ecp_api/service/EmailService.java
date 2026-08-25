package com.example.ecp_api.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String fullName, String otpCode);
}
