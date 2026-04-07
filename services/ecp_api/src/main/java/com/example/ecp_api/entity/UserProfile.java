package com.example.ecp_api.entity;

import com.example.ecp_api.enums.users.MembershipTier;
import com.example.ecp_api.enums.users.UserGender;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {
    @Id
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID userId; // Use the same ID as the User table.

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // This is marked as both a PK and an FK referencing the users table.
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    private UserGender gender;

    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_tier")
    private MembershipTier membershipTier = MembershipTier.MEMBER;

    // Convert JSON-based maps in MySQL to Java maps (or create a separate DTO) in Java.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> preferences;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}