package com.example.ecp_api.config;

import com.example.ecp_api.entity.jpa.User;
import com.example.ecp_api.entity.jpa.UserProfile;
import com.example.ecp_api.entity.jpa.Permission;
import com.example.ecp_api.entity.jpa.Role;
import com.example.ecp_api.enums.users.AuthProvider;
import com.example.ecp_api.repository.jpa.UserRepository;
import com.example.ecp_api.repository.jpa.PermissionRepository;
import com.example.ecp_api.repository.jpa.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public void run(String... args) {
        initializeDefaults();
    }

    @Transactional
    public void initializeDefaults() {
        log.info("Initializing system roles, permissions and default accounts...");
        initializeRolesAndPermissions();
        initializeUsers();
        log.info("System roles, permissions and default accounts initialized successfully.");
    }

    private void initializeRolesAndPermissions() {
        log.info("Seeding system permissions and roles...");
        List<Permission> permissions = List.of(
                Permission.builder().code("user:read").name("Xem người dùng").module("USER").description("Xem danh sách và chi tiết tài khoản người dùng").build(),
                Permission.builder().code("user:create").name("Tạo người dùng").module("USER").description("Tạo tài khoản người dùng mới").build(),
                Permission.builder().code("user:update").name("Sửa người dùng").module("USER").description("Cập nhật thông tin tài khoản người dùng").build(),
                Permission.builder().code("user:delete").name("Xóa người dùng").module("USER").description("Xóa (xóa mềm) tài khoản người dùng").build(),
                Permission.builder().code("role:read").name("Xem vai trò").module("ROLE").description("Xem danh sách vai trò và phân quyền").build(),
                Permission.builder().code("role:create").name("Tạo vai trò").module("ROLE").description("Tạo vai trò tùy chỉnh mới").build(),
                Permission.builder().code("role:update").name("Sửa vai trò").module("ROLE").description("Cập nhật vai trò và danh sách quyền").build(),
                Permission.builder().code("role:delete").name("Xóa vai trò").module("ROLE").description("Xóa vai trò tùy chỉnh").build(),
                Permission.builder().code("product:read").name("Xem sản phẩm").module("PRODUCT").description("Xem danh sách và chi tiết sản phẩm").build(),
                Permission.builder().code("product:create").name("Tạo sản phẩm").module("PRODUCT").description("Tạo sản phẩm mới").build(),
                Permission.builder().code("product:update").name("Sửa sản phẩm").module("PRODUCT").description("Cập nhật sản phẩm").build(),
                Permission.builder().code("product:delete").name("Xóa sản phẩm").module("PRODUCT").description("Xóa sản phẩm").build(),
                Permission.builder().code("category:read").name("Xem danh mục").module("CATEGORY").description("Xem danh mục sản phẩm").build(),
                Permission.builder().code("category:create").name("Tạo danh mục").module("CATEGORY").description("Tạo danh mục sản phẩm mới").build(),
                Permission.builder().code("category:update").name("Sửa danh mục").module("CATEGORY").description("Cập nhật danh mục sản phẩm").build(),
                Permission.builder().code("category:delete").name("Xóa danh mục").module("CATEGORY").description("Xóa danh mục sản phẩm").build(),
                Permission.builder().code("brand:read").name("Xem thương hiệu").module("BRAND").description("Xem thương hiệu sản phẩm").build(),
                Permission.builder().code("brand:create").name("Tạo thương hiệu").module("BRAND").description("Tạo thương hiệu mới").build(),
                Permission.builder().code("brand:update").name("Sửa thương hiệu").module("BRAND").description("Cập nhật thương hiệu").build(),
                Permission.builder().code("brand:delete").name("Xóa thương hiệu").module("BRAND").description("Xóa thương hiệu").build(),
                Permission.builder().code("sku:read").name("Xem SKU").module("SKU").description("Xem danh sách mã SKU").build(),
                Permission.builder().code("sku:create").name("Tạo SKU").module("SKU").description("Tạo mã SKU mới").build(),
                Permission.builder().code("sku:update").name("Sửa SKU").module("SKU").description("Cập nhật mã SKU").build(),
                Permission.builder().code("sku:delete").name("Xóa SKU").module("SKU").description("Xóa mã SKU").build(),
                Permission.builder().code("supplier:read").name("Xem nhà cung cấp").module("SUPPLIER").description("Xem nhà cung cấp").build(),
                Permission.builder().code("supplier:create").name("Tạo nhà cung cấp").module("SUPPLIER").description("Tạo nhà cung cấp").build(),
                Permission.builder().code("supplier:update").name("Sửa nhà cung cấp").module("SUPPLIER").description("Cập nhật nhà cung cấp").build(),
                Permission.builder().code("supplier:delete").name("Xóa nhà cung cấp").module("SUPPLIER").description("Xóa nhà cung cấp").build(),
                Permission.builder().code("warehouse:read").name("Xem nhà kho").module("WAREHOUSE").description("Xem danh sách nhà kho").build(),
                Permission.builder().code("warehouse:create").name("Tạo nhà kho").module("WAREHOUSE").description("Tạo nhà kho").build(),
                Permission.builder().code("warehouse:update").name("Sửa nhà kho").module("WAREHOUSE").description("Cập nhật nhà kho").build(),
                Permission.builder().code("warehouse:delete").name("Xóa nhà kho").module("WAREHOUSE").description("Xóa nhà kho").build(),
                Permission.builder().code("purchase_order:read").name("Xem đơn nhập hàng").module("PURCHASE_ORDER").description("Xem đơn nhập hàng PO").build(),
                Permission.builder().code("purchase_order:create").name("Tạo đơn nhập hàng").module("PURCHASE_ORDER").description("Tạo đơn nhập hàng PO").build(),
                Permission.builder().code("purchase_order:update").name("Sửa đơn nhập hàng").module("PURCHASE_ORDER").description("Cập nhật đơn nhập hàng PO").build(),
                Permission.builder().code("purchase_order:delete").name("Xóa đơn nhập hàng").module("PURCHASE_ORDER").description("Xóa đơn nhập hàng PO").build(),
                Permission.builder().code("goods_receipt:read").name("Xem phiếu nhập kho").module("GOODS_RECEIPT").description("Xem phiếu nhập kho").build(),
                Permission.builder().code("goods_receipt:create").name("Tạo phiếu nhập kho").module("GOODS_RECEIPT").description("Tạo phiếu nhập kho").build(),
                Permission.builder().code("goods_receipt:update").name("Sửa phiếu nhập kho").module("GOODS_RECEIPT").description("Cập nhật phiếu nhập kho").build(),
                Permission.builder().code("goods_receipt:delete").name("Xóa phiếu nhập kho").module("GOODS_RECEIPT").description("Xóa phiếu nhập kho").build(),
                Permission.builder().code("inventory:read").name("Xem tồn kho").module("INVENTORY").description("Xem danh sách tồn kho và sổ nhật ký").build(),
                Permission.builder().code("inventory:manage").name("Quản lý tồn kho").module("INVENTORY").description("Điều chỉnh và quản lý tồn kho").build(),
                Permission.builder().code("inventory:export").name("Xuất file tồn kho").module("INVENTORY").description("Xuất file Excel tồn kho").build(),
                Permission.builder().code("audit:read").name("Xem nhật ký hệ thống").module("AUDIT").description("Xem nhật ký truy vết hệ thống Audit Log").build(),
                Permission.builder().code("system:purge").name("Dọn dẹp hệ thống").module("SYSTEM").description("Xóa dữ liệu sản phẩm và kho hàng; giữ nguyên tài khoản, phân quyền và nhật ký").build()
        );

        for (Permission p : permissions) {
            if (permissionRepository.findByCode(p.getCode()).isEmpty()) {
                permissionRepository.save(p);
            }
        }

        Set<Permission> allPermissions = new HashSet<>(permissionRepository.findAll());

        if (!roleRepository.existsByCode("SUPER_ADMIN")) {
            roleRepository.save(Role.builder()
                    .code("SUPER_ADMIN")
                    .name("Quản trị viên cao cấp")
                    .description("Quản trị viên toàn quyền hệ thống")
                    .isSystem(true)
                    .permissions(allPermissions)
                    .build());
        }

        if (!roleRepository.existsByCode("MANAGER")) {
            Set<Permission> managerPermissions = allPermissions.stream()
                    .filter(p -> !p.getCode().equalsIgnoreCase("system:purge") && !p.getCode().equalsIgnoreCase("user:delete"))
                    .collect(Collectors.toSet());

            roleRepository.save(Role.builder()
                    .code("MANAGER")
                    .name("Quản lý kho & hệ thống")
                    .description("Quản lý hoạt động kinh doanh, kho hàng và sản phẩm")
                    .isSystem(true)
                    .permissions(managerPermissions)
                    .build());
        }

        if (!roleRepository.existsByCode("USER")) {
            roleRepository.save(Role.builder()
                    .code("USER")
                    .name("Khách hàng")
                    .description("Người dùng mua sắm thông thường")
                    .isSystem(true)
                    .permissions(new HashSet<>())
                    .build());
        }
    }

    private void initializeUsers() {
        Role superAdminRole = roleRepository.findByCode("SUPER_ADMIN").orElse(null);
        Role managerRole = roleRepository.findByCode("MANAGER").orElse(null);
        Role userRole = roleRepository.findByCode("USER").orElse(null);

        // Super Admin
        String adminEmail = "admin@ecp.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            log.info("Seeding Super Admin account...");
            User admin = User.builder()
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .roles(superAdminRole != null ? Set.of(superAdminRole) : new HashSet<>())
                    .provider(AuthProvider.LOCAL)
                    .active(true)
                    .emailVerified(true)
                    .build();

            UserProfile profile = UserProfile.builder()
                    .user(admin)
                    .firstName("Quản trị")
                    .lastName("Viên")
                    .phoneNumber("0912345678")
                    .build();

            admin.setProfile(profile);
            userRepository.save(admin);
        }

        // Manager
        String managerEmail = "manager@ecp.com";
        if (!userRepository.existsByEmail(managerEmail)) {
            log.info("Seeding Manager account...");
            User manager = User.builder()
                    .email(managerEmail)
                    .passwordHash(passwordEncoder.encode("manager123"))
                    .roles(managerRole != null ? Set.of(managerRole) : new HashSet<>())
                    .provider(AuthProvider.LOCAL)
                    .active(true)
                    .emailVerified(true)
                    .build();

            UserProfile profile = UserProfile.builder()
                    .user(manager)
                    .firstName("Quản Lý")
                    .lastName("Kho")
                    .phoneNumber("0987654321")
                    .build();

            manager.setProfile(profile);
            userRepository.save(manager);
        }

        // Regular User
        String userEmail = "user@ecp.com";
        if (!userRepository.existsByEmail(userEmail)) {
            log.info("Seeding Customer account...");
            User user = User.builder()
                    .email(userEmail)
                    .passwordHash(passwordEncoder.encode("user123"))
                    .roles(userRole != null ? Set.of(userRole) : new HashSet<>())
                    .provider(AuthProvider.LOCAL)
                    .active(true)
                    .emailVerified(true)
                    .build();

            UserProfile profile = UserProfile.builder()
                    .user(user)
                    .firstName("Khách Hàng")
                    .lastName("Thân Thiết")
                    .phoneNumber("0905123456")
                    .build();

            user.setProfile(profile);
            userRepository.save(user);
        }
    }

}
