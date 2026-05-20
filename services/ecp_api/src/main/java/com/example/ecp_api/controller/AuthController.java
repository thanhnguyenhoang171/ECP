package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.LoginRequest;
import com.example.ecp_api.dto.request.RefreshTokenRequest;
import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.AuthResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.security.CustomUserDetails;
import com.example.ecp_api.security.CustomUserDetailsService;
import com.example.ecp_api.security.JwtTokenProvider;
import com.example.ecp_api.service.TokenService;
import com.example.ecp_api.service.UserService;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final JwtTokenProvider jwtTokenProvider;
        private final TokenService tokenService;
        private final UserService userService;
        private final com.example.ecp_api.service.AuditLogService auditLogService;
        private final CustomUserDetailsService customUserDetailsService;

        @PostMapping("/register")
        public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody UserRequest userRequest) {
                UserResponse response = userService.registerUserByUsername(userRequest);
                ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                                .success(true)
                                .message("User registered successfully")
                                .data(response)
                                .build();
                return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
        }

        @PostMapping("/login")
        public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(
                        @Valid @RequestBody LoginRequest loginRequest,
                        HttpServletRequest request,
                        HttpServletResponse response) {

                try {
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                        loginRequest.getPassword()));

                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
                        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

                        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

                        // Save tokens to Redis
                        tokenService.saveAccessToken(accessToken, userDetails.getUsername(),
                                        jwtTokenProvider.getJwtExpirationMs());
                        tokenService.saveRefreshToken(refreshToken, userDetails.getUsername(),
                                        jwtTokenProvider.getRefreshExpirationMs());

                        List<String> roles = userDetails.getAuthorities().stream()
                                        .map(GrantedAuthority::getAuthority)
                                        .collect(Collectors.toList());

                        AuthResponse authResponse = AuthResponse.builder()
                                        .id(userDetails.getId().toString())
                                        .accessToken(accessToken)
                                        .refreshToken(refreshToken)
                                        .username(userDetails.getUsername())
                                        .email(userDetails.getEmail())
                                        .roles(roles)
                                        .build();

                        ApiResponse<AuthResponse> apiResponse = ApiResponse.<AuthResponse>builder()
                                        .success(true)
                                        .message("Login successful")
                                        .data(authResponse)
                                        .build();

                        // Set Refresh Token in HttpOnly Cookie
                        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                                        .httpOnly(true)
                                        .secure(true) // ideally true in production, set false if testing on localhost http
                                        .path("/api/auth")
                                        .maxAge(jwtTokenProvider.getRefreshExpirationMs() / 1000)
                                        .sameSite("Strict")
                                        .build();
                        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                        // Log success
                        auditLogService.log("LOGIN_SUCCESS", userDetails.getUsername(), "User logged in from " + request.getRemoteAddr());

                        return ResponseEntity.ok(apiResponse);
                } catch (Exception e) {
                        // Log failure
                        auditLogService.log("LOGIN_FAILURE", loginRequest.getUsername(), "Failed login attempt from " + request.getRemoteAddr() + ": " + e.getMessage());
                        throw e;
                }
        }

        @PostMapping("/refresh")
        public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
                        @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
                        @RequestBody(required = false) RefreshTokenRequest request) {

                String requestRefreshToken = cookieRefreshToken;
                if (!StringUtils.hasText(requestRefreshToken) && request != null) {
                        requestRefreshToken = request.getRefreshToken();
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
                                        .id(userDetails.getId().toString())
                                        .accessToken(newAccessToken)
                                        .refreshToken(requestRefreshToken)
                                        .username(userDetails.getUsername())
                                        .email(userDetails.getEmail())
                                        .roles(roles)
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
        public ResponseEntity<ApiResponse<Void>> logout(
                        @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
                        @RequestBody(required = false) RefreshTokenRequest logoutRequest,
                        HttpServletRequest request,
                        HttpServletResponse response) {

                String headerAuth = request.getHeader("Authorization");
                String accessToken = null;

                if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
                        accessToken = headerAuth.substring(7);
                }

                String refreshToken = cookieRefreshToken;
                if (!StringUtils.hasText(refreshToken) && logoutRequest != null) {
                        refreshToken = logoutRequest.getRefreshToken();
                }

                // Delete tokens from Redis
                tokenService.deleteTokens(accessToken, refreshToken);

                // Log logout
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String username = (auth != null) ? auth.getName() : "UNKNOWN";
                auditLogService.log("LOGOUT", username, "User logged out from " + request.getRemoteAddr());

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
