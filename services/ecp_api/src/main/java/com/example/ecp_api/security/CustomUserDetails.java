package com.example.ecp_api.security;

import com.example.ecp_api.entity.jpa.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

@Data
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    private UUID id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean active;

    public static CustomUserDetails build(User user) {
        java.util.Set<GrantedAuthority> authorities = new java.util.HashSet<>();
        if (user.getRoles() != null) {
            for (com.example.ecp_api.entity.jpa.Role role : user.getRoles()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getCode().toUpperCase()));
                if (role.getPermissions() != null) {
                    for (com.example.ecp_api.entity.jpa.Permission perm : role.getPermissions()) {
                        authorities.add(new SimpleGrantedAuthority(perm.getCode()));
                    }
                }
            }
        }

        String firstName = user.getProfile() != null ? user.getProfile().getFirstName() : null;
        String lastName = user.getProfile() != null ? user.getProfile().getLastName() : null;
        String avatarUrl = user.getProfile() != null ? user.getProfile().getAvatarUrl() : null;

        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                firstName,
                lastName,
                avatarUrl,
                authorities,
                user.isActive()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
