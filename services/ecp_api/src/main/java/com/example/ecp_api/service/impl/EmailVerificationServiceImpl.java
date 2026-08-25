package com.example.ecp_api.service.impl;

import com.example.ecp_api.entity.jpa.User;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.repository.jpa.UserRepository;
import com.example.ecp_api.service.EmailService;
import com.example.ecp_api.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final String OTP_PREFIX = "verify_otp:";
    private static final String COOLDOWN_PREFIX = "verify_otp:cooldown:";
    private static final long OTP_EXPIRE_MINUTES = 10;
    private static final long COOLDOWN_SECONDS = 60;

    @Override
    public void sendVerificationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        if (user.isEmailVerified()){
            throw new AppException("EMAIL_ALREADY_VERIFIED", "Email already verified", HttpStatus.BAD_REQUEST);
        }

        String fullName = "";
        if (user.getProfile() != null) {
            String lastName = user.getProfile().getLastName();
            String firstName = user.getProfile().getFirstName();
            fullName = ((lastName != null ? lastName : "") + " " + (firstName != null ? firstName : "")).trim();
        }
        if (fullName.isEmpty()) {
            fullName = user.getEmail();
        }


        // Check Cooldown 60s
        String cooldownKey = COOLDOWN_PREFIX + email;
        if (redisTemplate.hasKey(cooldownKey)) {
            Long ttl = redisTemplate.getExpire(cooldownKey, TimeUnit.SECONDS);
            throw new AppException("OTP_COOLDOWN", "Please wait " + (ttl !=null ? ttl: 60) + " seconds before requesting a new OTP", HttpStatus.TOO_MANY_REQUESTS);
        }

        // Generate OTP code (6 digits)
        String otpCode = String.format("%06d", new SecureRandom().nextInt(1000000));

        // Store OTP and Cooldown to Redis
        String  otpKey = OTP_PREFIX + email;
        redisTemplate.opsForValue().set(otpKey, otpCode, OTP_EXPIRE_MINUTES, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(cooldownKey, "true", COOLDOWN_SECONDS, TimeUnit.SECONDS);

        // Send Asynchronous email
        emailService.sendOtpEmail(email, fullName, otpCode);
    }

    @Override
    @Transactional
    public void verifyEmail(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        if (user.isEmailVerified()) {
            throw new AppException("EMAIL_ALREADY_VERIFIED", "Email already verified", HttpStatus.BAD_REQUEST);
        }

        String otpKey = OTP_PREFIX + email;
        String cachedOtp = redisTemplate.opsForValue().get(otpKey); // Get OTP in redis

        if (cachedOtp == null || !cachedOtp.equals(otpCode)) {
            throw new AppException("INVALID_OTP", "Invalid or expired OTP code", HttpStatus.BAD_REQUEST);
        }

        // Update user status
        user.setEmailVerified(true);
        userRepository.save(user);

        // Remove OTP in Redis after verify successfully
        redisTemplate.delete(otpKey);
        redisTemplate.delete(COOLDOWN_PREFIX + email);

        log.info("Email {} successfully verified", email);
    }
}
