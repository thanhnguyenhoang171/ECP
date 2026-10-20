package com.example.ecp_api.service;

import com.example.ecp_api.entity.jpa.UserPurgeCredential;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.repository.jpa.UserPurgeCredentialRepository;
import com.example.ecp_api.repository.jpa.UserRepository;
import com.example.ecp_api.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.List;
import java.time.LocalDateTime;
import com.example.ecp_api.dto.response.PurgePasswordStatus;
import com.example.ecp_api.dto.response.PurgePasswordApproval;
import org.springframework.security.access.prepost.PreAuthorize;

@Service
@RequiredArgsConstructor
public class PurgePasswordService {
    private final UserPurgeCredentialRepository credentials;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    private UUID currentUserId() {
        UUID id = SecurityUtils.getCurrentUserId();
        if (id == null || !users.existsById(id)) {
            throw new AppException("AUTH_REQUIRED", "Vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED);
        }
        return id;
    }

    @Transactional(readOnly = true)
    public boolean isConfigured() {
        return credentials.findById(currentUserId())
                .filter(credential -> StringUtils.hasText(credential.getPasswordHash())).isPresent();
    }

    @Transactional(readOnly = true)
    public PurgePasswordStatus getStatus() {
        UUID id = currentUserId();
        var credential = credentials.findById(id)
                .filter(value -> StringUtils.hasText(value.getPasswordHash()));
        boolean admin = SecurityUtils.isSuperAdmin();
        return new PurgePasswordStatus(credential.isPresent(),
                credential.isPresent() && (admin || credential.get().isApproved()), admin);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Transactional(readOnly = true)
    public List<PurgePasswordApproval> pendingApprovals() {
        currentUserId();
        return credentials.findAll().stream()
                .filter(value -> !value.isApproved() && StringUtils.hasText(value.getPasswordHash()))
                .flatMap(value -> users.findById(value.getUserId())
                        .filter(user -> !user.hasRole("SUPER_ADMIN"))
                        .map(user -> new PurgePasswordApproval(user.getId(), user.getEmail(),
                                value.getUpdatedAt(), value.getVersion())).stream())
                .toList();
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Transactional
    public void approve(UUID userId, Long version) {
        currentUserId();
        UserPurgeCredential credential = credentials.findById(userId)
                .orElseThrow(() -> new AppException("PURGE_PASSWORD_NOT_CONFIGURED",
                        "Tài khoản chưa tạo mật khẩu xoá dữ liệu", HttpStatus.CONFLICT));
        if (!java.util.Objects.equals(version, credential.getVersion()) || credential.isApproved()) {
            throw new AppException("PURGE_APPROVAL_STALE", "Yêu cầu đã thay đổi. Vui lòng tải lại danh sách duyệt", HttpStatus.CONFLICT);
        }
        credential.setApproved(true);
        credential.setApprovedBy(SecurityUtils.getCurrentUserEmail());
        credential.setApprovedAt(LocalDateTime.now());
        credentials.saveAndFlush(credential);
        auditAfterCommit("SYSTEM_PURGE_PASSWORD_APPROVED", SecurityUtils.getCurrentUserEmail(),
                "Đã duyệt mật khẩu xoá dữ liệu cho tài khoản ID: " + userId + "; phiên bản: " + version);
    }

    private void auditAfterCommit(String action, String email, String details) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            auditLogService.log(action, email, details);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                auditLogService.log(action, email, details);
            }
        });
    }

    @Transactional
    public void setPassword(String currentPassword, String newPassword) {
        String email = SecurityUtils.getCurrentUserEmail();
        try {
            UUID id = currentUserId();
            if (!StringUtils.hasText(newPassword) || newPassword.length() < 8
                    || newPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
                throw new AppException("PURGE_PASSWORD_INVALID", "Mật khẩu cần ít nhất 8 ký tự và tối đa 72 byte", HttpStatus.BAD_REQUEST);
            }
            UserPurgeCredential credential = credentials.findById(id).orElseGet(() -> {
                UserPurgeCredential created = new UserPurgeCredential();
                created.setUserId(id);
                return created;
            });
            boolean changingPassword = StringUtils.hasText(credential.getPasswordHash());
            if (changingPassword) {
                requireMatch(currentPassword, credential.getPasswordHash());
            }
            credential.setPasswordHash(passwordEncoder.encode(newPassword));
            boolean admin = SecurityUtils.isSuperAdmin();
            credential.setApproved(admin);
            credential.setApprovedBy(admin ? email : null);
            credential.setApprovedAt(admin ? LocalDateTime.now() : null);
            credentials.save(credential);
            if (!admin) {
                auditAfterCommit("SYSTEM_PURGE_PASSWORD_APPROVAL_REQUESTED", email,
                        "Yêu cầu admin duyệt mật khẩu xoá dữ liệu cho tài khoản ID: " + id);
            }
            recordPasswordChange(email, id, changingPassword);
        } catch (RuntimeException error) {
            String reason = error instanceof AppException appError ? appError.getCode() : error.getClass().getSimpleName();
            auditLogService.log("SYSTEM_PURGE_PASSWORD_SAVE_FAILED", email,
                    "Không thể lưu mật khẩu xoá dữ liệu. Mã lỗi: " + reason, "FAILURE");
            throw error;
        }
    }

    private void recordPasswordChange(String email, UUID userId, boolean changingPassword) {
        String action = changingPassword ? "SYSTEM_PURGE_PASSWORD_CHANGED" : "SYSTEM_PURGE_PASSWORD_CREATED";
        String details = (changingPassword ? "Đã đổi" : "Đã tạo") + " mật khẩu xoá dữ liệu cho tài khoản ID: " + userId;
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            auditLogService.log(action, email, details);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_COMMITTED) {
                    auditLogService.log(action, email, details);
                } else {
                    auditLogService.log("SYSTEM_PURGE_PASSWORD_SAVE_FAILED", email,
                            "Giao dịch lưu mật khẩu xoá dữ liệu đã bị huỷ cho tài khoản ID: " + userId, "FAILURE");
                }
            }
        });
    }

    @Transactional(readOnly = true)
    public void verifyPassword(String password) {
        UserPurgeCredential credential = credentials.findById(currentUserId())
                .filter(value -> StringUtils.hasText(value.getPasswordHash()))
                .orElseThrow(() -> new AppException("PURGE_PASSWORD_NOT_CONFIGURED",
                        "Bạn cần tạo mật khẩu xoá dữ liệu tại trang Hồ sơ cá nhân trước", HttpStatus.CONFLICT));
        if (!SecurityUtils.isSuperAdmin() && !credential.isApproved()) {
            throw new AppException("PURGE_PASSWORD_APPROVAL_REQUIRED",
                    "Mật khẩu xoá dữ liệu cần được admin duyệt trước khi sử dụng", HttpStatus.FORBIDDEN);
        }
        requireMatch(password, credential.getPasswordHash());
    }

    private void requireMatch(String password, String hash) {
        if (!StringUtils.hasText(password) || password.getBytes(StandardCharsets.UTF_8).length > 72
                || !passwordEncoder.matches(password, hash)) {
            throw new AppException("PURGE_PASSWORD_INCORRECT", "Mật khẩu xoá dữ liệu không đúng", HttpStatus.BAD_REQUEST);
        }
    }
}
