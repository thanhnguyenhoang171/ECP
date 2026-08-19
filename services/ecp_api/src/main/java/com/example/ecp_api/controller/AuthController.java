package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.*;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.AuthResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.security.CustomUserDetails;
import com.example.ecp_api.security.CustomUserDetailsService;
import com.example.ecp_api.security.JwtTokenProvider;
import com.example.ecp_api.service.TokenService;
import com.example.ecp_api.service.UserService;
import com.example.ecp_api.util.IpUtils;
import com.example.ecp_api.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Tag(name = "[COMMON] Authentication", description = "Public API: Register, login, logout, refresh token, and Google OAuth. Available to all users (SUPER_ADMIN, MANAGER, USER).")
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final JwtTokenProvider jwtTokenProvider;
        private final TokenService tokenService;
        private final UserService userService;
        private final com.example.ecp_api.service.AuditLogService auditLogService;
        private final CustomUserDetailsService customUserDetailsService;

        @PostMapping("/register")
        @Operation(summary = "Register a new user", description = "Creates a new user account with default USER role using Email.")
        public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
                UserResponse response = userService.registerUserByEmail(request);
                ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                                .success(true)
                                .message("User registered successfully")
                                .data(response)
                                .build();
                return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
        }

        @PostMapping("/login")
        @Operation(summary = "Login to the system", description = "Authenticates user with Email and returns Access Token and Refresh Token.")
        public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(
                        @Valid @RequestBody LoginRequest loginRequest,
                        HttpServletRequest request,
                        HttpServletResponse response) {

                try {
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(loginRequest.getEmail(),
                                                        loginRequest.getPassword()));

                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
                        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

                        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

                        // Save tokens to Redis
                        tokenService.saveAccessToken(accessToken, userDetails.getEmail(),
                                        jwtTokenProvider.getJwtExpirationMs());
                        tokenService.saveRefreshToken(refreshToken, userDetails.getEmail(),
                                        jwtTokenProvider.getRefreshExpirationMs());

                        List<String> roles = userDetails.getAuthorities().stream()
                                        .map(GrantedAuthority::getAuthority)
                                        .collect(Collectors.toList());

                        AuthResponse authResponse = AuthResponse.builder()
                                        .accessToken(accessToken)
                                        .refreshToken(refreshToken)
                                        .tokenType("Bearer")
                                        .build();

                        ApiResponse<AuthResponse> apiResponse = ApiResponse.<AuthResponse>builder()
                                        .success(true)
                                        .message("Login successful")
                                        .data(authResponse)
                                        .build();

                        // Set Refresh Token in HttpOnly Cookie
                        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                                        .httpOnly(true)
                                        .secure(true)
                                        .path("/api/auth")
                                        .maxAge(jwtTokenProvider.getRefreshExpirationMs() / 1000)
                                        .sameSite("Strict")
                                        .build();
                        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                        // Log success
                        auditLogService.log("LOGIN_SUCCESS", userDetails.getEmail(), "User logged in", "SUCCESS");

                        // Update last login in database
                        userService.updateLastLogin(userDetails.getEmail());

                        return ResponseEntity.ok(apiResponse);
                } catch (Exception e) {
                        // Log failure
                        auditLogService.log("LOGIN_FAILURE", loginRequest.getEmail(), "Failed login attempt: " + e.getMessage(), "FAILURE");
                        throw e;
                }
        }

        @PostMapping("/google")
        @Operation(summary = "Login or Register with Google", description = "Authenticates user using Google ID Token.")
        public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
                        @Valid @RequestBody GoogleLoginRequest googleLoginRequest,
                        HttpServletResponse response) {

                UserResponse userResponse = userService.processGoogleLogin(googleLoginRequest);
                CustomUserDetails userDetails = (CustomUserDetails) customUserDetailsService.loadUserByUsername(userResponse.getEmail());

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);

                String accessToken = jwtTokenProvider.generateAccessToken(authentication);
                String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

                tokenService.saveAccessToken(accessToken, userDetails.getEmail(), jwtTokenProvider.getJwtExpirationMs());
                tokenService.saveRefreshToken(refreshToken, userDetails.getEmail(), jwtTokenProvider.getRefreshExpirationMs());

                List<String> roles = userDetails.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList());

                AuthResponse authResponse = AuthResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .tokenType("Bearer")
                                .build();

                ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                                .httpOnly(true)
                                .secure(true)
                                .path("/api/auth")
                                .maxAge(jwtTokenProvider.getRefreshExpirationMs() / 1000)
                                .sameSite("Strict")
                                .build();
                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                userService.updateLastLogin(userDetails.getEmail());

                return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                                .success(true)
                                .message("Google login successful")
                                .data(authResponse)
                                .build());
        }

        @PostMapping("/refresh")
        @Operation(summary = "Refresh Access Token", description = "Generates a new Access Token using a valid Refresh Token. Accepts token via HttpOnly Cookie (Web Browsers) or JSON Request Body (Mobile/Postman).")
        public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
                        @Parameter(hidden = true) @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
                        @RequestBody(required = false) RefreshTokenRequest request) {

                String requestRefreshToken = null;
                if (request != null && StringUtils.hasText(request.getRefreshToken())) {
                        requestRefreshToken = request.getRefreshToken();
                } else {
                        requestRefreshToken = cookieRefreshToken;
                }

                if (!StringUtils.hasText(requestRefreshToken)) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                        ApiResponse.<AuthResponse>builder().success(false)
                                                         .message("Refresh token is missing").build());
                }

                if (jwtTokenProvider.validateJwtToken(requestRefreshToken)
                                && tokenService.validateRefreshToken(requestRefreshToken)) {
                        String username = jwtTokenProvider.getUsernameFromJwtToken(requestRefreshToken);

                        CustomUserDetails userDetails = (CustomUserDetails) customUserDetailsService
                                        .loadUserByUsername(username);
                        String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);

                        // Save new access token to Redis
                        tokenService.saveAccessToken(newAccessToken, username, jwtTokenProvider.getJwtExpirationMs());

                        List<String> roles = userDetails.getAuthorities().stream()
                                        .map(GrantedAuthority::getAuthority)
                                        .collect(Collectors.toList());

                        AuthResponse authResponse = AuthResponse.builder()
                                        .accessToken(newAccessToken)
                                        .refreshToken(requestRefreshToken)
                                        .tokenType("Bearer")
                                        .build();

                        ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                                        .success(true)
                                        .message("Token refreshed successfully")
                                        .data(authResponse)
                                        .build();

                        return ResponseEntity.ok(response);
                }

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                                ApiResponse.<AuthResponse>builder().success(false)
                                                .message("Invalid or expired refresh token").build());
        }

        @PostMapping("/logout")
        @Operation(summary = "Logout", description = "Invalidates tokens in Redis and clears the Refresh Token cookie. Accepts token via HttpOnly Cookie (Web Browsers) or JSON Request Body (Mobile/Postman).")
        public ResponseEntity<ApiResponse<Void>> logout(
                        @Parameter(hidden = true) @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
                        @RequestBody(required = false) RefreshTokenRequest logoutRequest,
                        HttpServletRequest request,
                        HttpServletResponse response) {

                String headerAuth = request.getHeader("Authorization");
                String accessToken = null;

                if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
                        accessToken = headerAuth.substring(7);
                }

                String refreshToken = null;
                if (logoutRequest != null && StringUtils.hasText(logoutRequest.getRefreshToken())) {
                        refreshToken = logoutRequest.getRefreshToken();
                } else {
                        refreshToken = cookieRefreshToken;
                }

                // Delete tokens from Redis
                tokenService.deleteTokens(accessToken, refreshToken);

                // Clear presence from Redis
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String username = (auth != null) ? auth.getName() : "UNKNOWN";
                tokenService.clearUserPresence(username);

                // Log logout
                auditLogService.log("LOGOUT", username, "User logged out", "SUCCESS");

                // Xóa Refresh Token Cookie
                ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                                .httpOnly(true)
                                .secure(true)
                                .path("/api/auth")
                                .maxAge(0)
                                .sameSite("Strict")
                                .build();
                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                return ResponseEntity.ok(ApiResponse.<Void>builder()
                                .success(true)
                                .message("Logout successful")
                                .build());
        }
}
