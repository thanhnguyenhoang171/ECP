package com.example.ecp_api.security;

import com.example.ecp_api.entity.jpa.User;
import com.example.ecp_api.repository.jpa.UserRepository;
import com.example.ecp_api.service.TokenService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtTokenProvider.validateJwtToken(jwt)) {
                
                // Check if token exists in Redis (not logged out)
                if (tokenService.validateAccessToken(jwt)) {
                    Claims claims = jwtTokenProvider.getClaimsFromJwtToken(jwt);
                    String username = claims.getSubject();
                    String email = claims.get("email", String.class);
                    if (email == null) email = username;

                    // Fetch user from database to verify real-time role & active status
                    User dbUser = userRepository.findByEmail(email).orElse(null);
                    if (dbUser == null || !dbUser.isActive()) {
                        log.warn("User {} is disabled or deleted in database", email);
                        filterChain.doFilter(request, response);
                        return;
                    }

                    String roleStr = "ROLE_" + dbUser.getRole().name();
                    List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(roleStr));

                    CustomUserDetails userDetails = new CustomUserDetails(
                            dbUser.getId(),
                            dbUser.getEmail(),
                            "", // Password not needed here
                            null,
                            null,
                            null,
                            authorities,
                            dbUser.isActive()
                    );
                    
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    // Update presence in Redis
                    tokenService.updateUserPresence(username);
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
