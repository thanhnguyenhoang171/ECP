package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.LoginRequest;
import com.example.ecp_api.dto.request.RefreshTokenRequest;
import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.AuthResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.security.CustomUserDetails;
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
            HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // Save tokens to Redis
        tokenService.saveAccessToken(accessToken, userDetails.getUsername(), jwtTokenProvider.getJwtExpirationMs());
        tokenService.saveRefreshToken(refreshToken, userDetails.getUsername(), jwtTokenProvider.getRefreshExpirationMs());

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        AuthResponse authResponse = AuthResponse.builder()
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
                .path("/api/auth/refresh")
                .maxAge(jwtTokenProvider.getRefreshExpirationMs() / 1000)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(apiResponse);
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
                ApiResponse.<AuthResponse>builder().success(false).message("Refresh token is missing").build()
             );
        }

        if (jwtTokenProvider.validateJwtToken(requestRefreshToken) && tokenService.validateRefreshToken(requestRefreshToken)) {
            String username = jwtTokenProvider.getUsernameFromJwtToken(requestRefreshToken);

            String newAccessToken = jwtTokenProvider.generateAccessTokenFromUsername(username);

            // Save new access token to Redis
            tokenService.saveAccessToken(newAccessToken, username, jwtTokenProvider.getJwtExpirationMs());

            AuthResponse authResponse = AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(requestRefreshToken) // keep old refresh token or issue a new one
                    .username(username)
                    .build();

            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                    .success(true)
                    .message("Token refreshed successfully")
                    .data(authResponse)
                    .build();

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiResponse.<AuthResponse>builder().success(false).message("Invalid or expired refresh token").build()
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        String headerAuth = request.getHeader("Authorization");
        String accessToken = null;

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            accessToken = headerAuth.substring(7);
        }

        // Ideally, client should also send refresh token in request body to delete it
        // Here we just delete the access token. To delete refresh token, we would need it from request.
        tokenService.deleteTokens(accessToken, null);

        // Xóa Refresh Token Cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/api/auth/refresh")
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
