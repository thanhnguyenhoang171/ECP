package com.example.ecp_api.config;

import com.example.ecp_api.entity.jpa.*;
import com.example.ecp_api.entity.mongodb.*;
import com.example.ecp_api.entity.mongodb.embedded.ProductImage;
import com.example.ecp_api.entity.mongodb.embedded.ProductVariant;
import com.example.ecp_api.enums.common.PurchaseOrderStatus;
import com.example.ecp_api.enums.common.ReceiptStatus;
import com.example.ecp_api.enums.common.TransactionType;
import com.example.ecp_api.enums.users.AuthProvider;
//import com.example.ecp_api.enums.users.MembershipTier;
import com.example.ecp_api.enums.users.UserRole;
import com.example.ecp_api.repository.jpa.*;
import com.example.ecp_api.repository.mongodb.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final SkuRepository skuRepository;
    private final InventoryRepository inventoryRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final GoodsReceiptRepository goodsReceiptRepository;
    private final InventoryLedgerRepository inventoryLedgerRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting system data initialization...");
        initializeRolesAndPermissions();
        initializeUsers();
        initializeAddresses();
        initializeSuppliers();
        initializeWarehouses();
        initializeBrandsAndCategoriesAndProducts();
        initializePurchaseOrdersAndGoodsReceiptsAndLedgers();
        log.info("System data initialization completed successfully!");
    }

    public void initializeDefaults() {
        try {
            initializeRolesAndPermissions();
            initializeUsers();
            initializeAddresses();
            initializeSuppliers();
            initializeWarehouses();
            initializeBrandsAndCategoriesAndProducts();
            initializePurchaseOrdersAndGoodsReceiptsAndLedgers();
        } catch (Exception e) {
            log.error("Error during manual data initialization", e);
        }
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
                Permission.builder().code("system:purge").name("Dọn dẹp hệ thống").module("SYSTEM").description("Xóa toàn bộ dữ liệu và khôi phục hệ thống").build()
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

    private void initializeSuppliers() {
        if (supplierRepository.count() == 0) {
            log.info("Seeding Suppliers...");
            Supplier s1 = Supplier.builder()
                    .name("Công ty Cổ phần Cacao Nông nghiệp Bến Tre")
                    .contactName("Nguyễn Văn Hùng")
                    .phone("02753812345")
                    .email("bentre.cacao@ecp.com")
                    .address("Số 45 Đường Nguyễn Đình Chiểu, Phường 1, TP. Bến Tre")
                    .taxCode("1300987654")
                    .active(true)
                    .build();

            Supplier s2 = Supplier.builder()
                    .name("Nhà cung cấp Nguyên liệu Cacao Lâm Đồng")
                    .contactName("Trần Thị Lan")
                    .phone("02633987654")
                    .email("lamdong.supplier@ecp.com")
                    .address("120 Đường Hùng Vương, Phường 9, TP. Đà Lạt, Lâm Đồng")
                    .taxCode("5801234567")
                    .active(true)
                    .build();

            supplierRepository.saveAll(Arrays.asList(s1, s2));
        }
    }

    private void initializeWarehouses() {
        if (warehouseRepository.count() == 0) {
            log.info("Seeding Warehouses...");
            Warehouse w1 = Warehouse.builder()
                    .code("WH-HCM-01")
                    .name("Kho Trung Tâm TP. Hồ Chí Minh")
                    .address("Lô B2, Đường KCN Tân Thuận, Quận 7, TP. Hồ Chí Minh")
                    .active(true)
                    .build();

            Warehouse w2 = Warehouse.builder()
                    .code("WH-HN-01")
                    .name("Kho Chi Nhánh Hà Nội")
                    .address("Khu Công nghiệp Cầu Giấy, Quận Cầu Giấy, Hà Nội")
                    .active(true)
                    .build();

            warehouseRepository.saveAll(Arrays.asList(w1, w2));
        }
    }

    private void initializeBrandsAndCategoriesAndProducts() {
        // Seed Brands if empty
        Brand bVinacacao = null;
        Brand bMarou = null;
        Brand bAlluvia = null;
        Brand bBelvie = null;

        if (brandRepository.count() == 0) {
            log.info("Seeding Brands...");
            bVinacacao = brandRepository.save(Brand.builder()
                    .name("Vinacacao")
                    .slug("vinacacao")
                    .description("Thương hiệu cacao hàng đầu Việt Nam")
                    .website("https://vinacacao.com.vn")
                    .active(true)
                    .build());

            bMarou = brandRepository.save(Brand.builder()
                    .name("Marou Chocolate")
                    .slug("marou-chocolate")
                    .description("Socola thủ công hảo hạng từ hạt cacao Việt")
                    .website("https://marouchocolate.com")
                    .active(true)
                    .build());

            bAlluvia = brandRepository.save(Brand.builder()
                    .name("Alluvia Chocolate")
                    .slug("alluvia-chocolate")
                    .description("Cacao & Socola nguyên chất đồng bằng sông Cửu Long")
                    .website("https://alluviachocolate.com")
                    .active(true)
                    .build());

            bBelvie = brandRepository.save(Brand.builder()
                    .name("Belvie Chocolate")
                    .slug("belvie-chocolate")
                    .description("Socola bean-to-bar thủ công cao cấp")
                    .website("https://belviechocolate.com.vn")
                    .active(true)
                    .build());
        } else {
            bVinacacao = brandRepository.findBySlugAndDeletedFalse("vinacacao").orElse(null);
            bMarou = brandRepository.findBySlugAndDeletedFalse("marou-chocolate").orElse(null);
            bAlluvia = brandRepository.findBySlugAndDeletedFalse("alluvia-chocolate").orElse(null);
            bBelvie = brandRepository.findBySlugAndDeletedFalse("belvie-chocolate").orElse(null);
        }

        // Seed Categories if empty
        Category cPure = null;
        Category cMilk = null;
        Category cCraft = null;
        Category cBarista = null;

        if (categoryRepository.count() == 0) {
            log.info("Seeding Categories...");
            cPure = categoryRepository.save(Category.builder()
                    .name("Bột Cacao Nguyên Chất")
                    .slug("bot-cacao-nguyen-chat")
                    .description("Bột cacao nguyên chất 100% không đường")
                    .sortOrder(1)
                    .isFeatured(true)
                    .active(true)
                    .build());

            cMilk = categoryRepository.save(Category.builder()
                    .name("Cacao Sữa & Hòa Tan")
                    .slug("cacao-sua-hoa-tan")
                    .description("Thức uống cacao pha chế tiện lợi 3in1")
                    .sortOrder(2)
                    .isFeatured(true)
                    .active(true)
                    .build());

            cCraft = categoryRepository.save(Category.builder()
                    .name("Socola Thanh Craft")
                    .slug("socola-thanh-craft")
                    .description("Thanh socola đen thủ công nguyên chất")
                    .sortOrder(3)
                    .isFeatured(true)
                    .active(true)
                    .build());

            cBarista = categoryRepository.save(Category.builder()
                    .name("Nguyên Liệu Pha Chế")
                    .slug("nguyen-lieu-pha-che")
                    .description("Cacao bơ và khối lượng lớn cho nhà hàng, quán cafe")
                    .sortOrder(4)
                    .isFeatured(false)
                    .active(true)
                    .build());
        } else {
            cPure = categoryRepository.findBySlug("bot-cacao-nguyen-chat").orElse(null);
            cMilk = categoryRepository.findBySlug("cacao-sua-hoa-tan").orElse(null);
            cCraft = categoryRepository.findBySlug("socola-thanh-craft").orElse(null);
            cBarista = categoryRepository.findBySlug("nguyen-lieu-pha-che").orElse(null);
        }

        // Seed Products & SKUs & Inventory if products empty
        if (productRepository.count() == 0 && cPure != null && bAlluvia != null) {
            log.info("Seeding Products, SKUs, and Inventory...");
            
            Warehouse hcmWarehouse = warehouseRepository.findAll().stream().findFirst().orElse(null);

            // Product 1: Bot Cacao Alluvia 100%
            String p1SkuCode = "ALLUVIA-PURE-500";
            ProductVariant v1 = ProductVariant.builder()
                    .sku(p1SkuCode)
                    .price(new BigDecimal("180000"))
                    .attributes(Collections.singletonMap("weight", "500g"))
                    .active(true)
                    .build();

            Product p1 = Product.builder()
                    .sku(p1SkuCode)
                    .name("Bột Cacao Nguyên Chất Alluvia 100%")
                    .slug("bot-cacao-nguyen-chat-alluvia-100")
                    .brand("Alluvia Chocolate")
                    .brandId(bAlluvia.getId())
                    .categoryId(cPure.getId())
                    .description("Bột cacao nguyên chất 100% được làm từ hạt cacao Tiền Giang tuyển chọn kỹ lưỡng. Thích hợp làm bánh và pha chế thức uống ngậy thơm tự nhiên.")
                    .thumbnail(ProductImage.builder().url("https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600").publicId("alluvia-pure").build())
                    .variants(Collections.singletonList(v1))
                    .published(true)
                    .isFeatured(true)
                    .isBestSeller(true)
                    .ratingAvg(new BigDecimal("4.9"))
                    .ratingCount(28)
                    .build();

            p1 = productRepository.save(p1);

            // Save Sku for Product 1
            if (!skuRepository.existsBySkuCode(p1SkuCode)) {
                Sku sku1 = skuRepository.save(Sku.builder()
                        .skuCode(p1SkuCode)
                        .barcode("893600000001")
                        .barcodeType("EAN-13")
                        .productId(p1.getId())
                        .variantId("v1-500g")
                        .productName(p1.getName())
                        .variantName("Hộp 500g")
                        .active(true)
                        .build());

                if (hcmWarehouse != null) {
                    inventoryRepository.save(Inventory.builder()
                            .warehouse(hcmWarehouse)
                            .sku(sku1)
                            .batchCode("BATCH-2026-001")
                            .quantityOnHand(150)
                            .quantityLocked(0)
                            .manufactureDate(LocalDateTime.now().minusDays(30))
                            .expiryDate(LocalDateTime.now().plusYears(1))
                            .build());
                }
            }

            // Product 2: Socola Marou Dak Lak 70%
            if (bMarou != null && cCraft != null) {
                String p2SkuCode = "MAROU-DARK-70";
                ProductVariant v2 = ProductVariant.builder()
                        .sku(p2SkuCode)
                        .price(new BigDecimal("120000"))
                        .attributes(Collections.singletonMap("weight", "80g"))
                        .active(true)
                        .build();

                Product p2 = Product.builder()
                        .sku(p2SkuCode)
                        .name("Socola Đen Marou Đắk Lắk 70%")
                        .slug("socola-den-marou-dak-lak-70")
                        .brand("Marou Chocolate")
                        .brandId(bMarou.getId())
                        .categoryId(cCraft.getId())
                        .description("Socola thủ công đạt nhiều giải thưởng quốc tế, có hương vị trái cây tự nhiên của hạt cacao trồng tại vùng đất đỏ Tây Nguyên Đắk Lắk.")
                        .thumbnail(ProductImage.builder().url("https://images.unsplash.com/photo-1511381939415-e44015466834?w=600").publicId("marou-dark-70").build())
                        .variants(Collections.singletonList(v2))
                        .published(true)
                        .isFeatured(true)
                        .isNew(true)
                        .ratingAvg(new BigDecimal("5.0"))
                        .ratingCount(42)
                        .build();

                p2 = productRepository.save(p2);

                if (!skuRepository.existsBySkuCode(p2SkuCode)) {
                    Sku sku2 = skuRepository.save(Sku.builder()
                            .skuCode(p2SkuCode)
                            .barcode("893600000002")
                            .barcodeType("EAN-13")
                            .productId(p2.getId())
                            .variantId("v2-80g")
                            .productName(p2.getName())
                            .variantName("Thanh 80g")
                            .active(true)
                            .build());

                    if (hcmWarehouse != null) {
                        inventoryRepository.save(Inventory.builder()
                                .warehouse(hcmWarehouse)
                                .sku(sku2)
                                .batchCode("BATCH-2026-002")
                                .quantityOnHand(200)
                                .quantityLocked(0)
                                .manufactureDate(LocalDateTime.now().minusDays(15))
                                .expiryDate(LocalDateTime.now().plusYears(2))
                                .build());
                    }
                }
            }
        }
    }

    private void initializeAddresses() {
        if (addressRepository.count() == 0) {
            log.info("Seeding Addresses...");
            User regularUser = userRepository.findByEmail("user@ecp.com").orElse(null);
            User adminUser = userRepository.findByEmail("admin@ecp.com").orElse(null);

            List<Address> addresses = new ArrayList<>();
            if (regularUser != null) {
                addresses.add(Address.builder()
                        .user(regularUser)
                        .recipientName("Khách Hàng Thân Thiết")
                        .phone("0905123456")
                        .province("TP. Hồ Chí Minh")
                        .district("Quận 1")
                        .ward("Phường Bến Nghé")
                        .streetDetail("123 Đường Lê Lợi")
                        .isDefault(true)
                        .build());
                addresses.add(Address.builder()
                        .user(regularUser)
                        .recipientName("Khách Hàng (Nhà riêng)")
                        .phone("0905123456")
                        .province("TP. Hồ Chí Minh")
                        .district("Quận 7")
                        .ward("Phường Tân Phong")
                        .streetDetail("456 Đường Nguyễn Hữu Thọ")
                        .isDefault(false)
                        .build());
            }

            if (adminUser != null) {
                addresses.add(Address.builder()
                        .user(adminUser)
                        .recipientName("Quản trị Viên")
                        .phone("0912345678")
                        .province("Hà Nội")
                        .district("Quận Cầu Giấy")
                        .ward("Phường Dịch Vọng")
                        .streetDetail("Tòa nhà ECP, Đường Duy Tân")
                        .isDefault(true)
                        .build());
            }

            if (!addresses.isEmpty()) {
                addressRepository.saveAll(addresses);
            }
        }
    }

    private void initializePurchaseOrdersAndGoodsReceiptsAndLedgers() {
        if (purchaseOrderRepository.count() == 0) {
            log.info("Seeding Purchase Orders, Goods Receipts, and Inventory Ledgers...");

            Warehouse hcmWarehouse = warehouseRepository.findAll().stream().findFirst().orElse(null);
            Supplier bentreSupplier = supplierRepository.findAll().stream().findFirst().orElse(null);

            if (hcmWarehouse != null && bentreSupplier != null) {
                Sku sku1 = skuRepository.findBySkuCode("ALLUVIA-PURE-500").orElse(null);
                Sku sku2 = skuRepository.findBySkuCode("MAROU-DARK-70").orElse(null);

                if (sku1 != null && sku2 != null) {
                    // 1. Seed Purchase Order
                    PurchaseOrder po = PurchaseOrder.builder()
                            .poCode("PO-2026-001")
                            .warehouse(hcmWarehouse)
                            .supplier(bentreSupplier)
                            .status(PurchaseOrderStatus.COMPLETED)
                            .note("Đơn nhập hàng nguyên liệu cacao đầu năm 2026")
                            .expectedDeliveryDate(LocalDateTime.now().minusDays(10))
                            .createdBy("admin@ecp.com")
                            .build();

                    PurchaseOrderItem item1 = PurchaseOrderItem.builder()
                            .purchaseOrder(po)
                            .sku(sku1)
                            .unitPrice(new BigDecimal("150000"))
                            .orderQuantity(150)
                            .receivedQuantity(150)
                            .createdBy("admin@ecp.com")
                            .build();

                    PurchaseOrderItem item2 = PurchaseOrderItem.builder()
                            .purchaseOrder(po)
                            .sku(sku2)
                            .unitPrice(new BigDecimal("100000"))
                            .orderQuantity(200)
                            .receivedQuantity(200)
                            .createdBy("admin@ecp.com")
                            .build();

                    po.setItems(Arrays.asList(item1, item2));
                    PurchaseOrder savedPo = purchaseOrderRepository.save(po);

                    // 2. Seed Goods Receipt
                    GoodsReceipt gr = GoodsReceipt.builder()
                            .receiptCode("GR-2026-001")
                            .purchaseOrder(savedPo)
                            .warehouse(hcmWarehouse)
                            .status(ReceiptStatus.RECEIVED)
                            .note("Nhập kho thành công 100% theo đơn PO-2026-001")
                            .receivedAt(LocalDateTime.now().minusDays(9))
                            .build();

                    GoodsReceiptItem grItem1 = GoodsReceiptItem.builder()
                            .goodsReceipt(gr)
                            .sku(sku1)
                            .batchCode("BATCH-2026-001")
                            .manufactureDate(LocalDateTime.now().minusDays(30))
                            .expiryDate(LocalDateTime.now().plusYears(1))
                            .quantity(150)
                            .unitCost(new BigDecimal("150000"))
                            .build();

                    GoodsReceiptItem grItem2 = GoodsReceiptItem.builder()
                            .goodsReceipt(gr)
                            .sku(sku2)
                            .batchCode("BATCH-2026-002")
                            .manufactureDate(LocalDateTime.now().minusDays(15))
                            .expiryDate(LocalDateTime.now().plusYears(2))
                            .quantity(200)
                            .unitCost(new BigDecimal("100000"))
                            .build();

                    gr.setItems(Arrays.asList(grItem1, grItem2));
                    GoodsReceipt savedGr = goodsReceiptRepository.save(gr);

                    // 3. Seed Inventory Ledgers
                    InventoryLedger ledger1 = InventoryLedger.builder()
                            .warehouse(hcmWarehouse)
                            .sku(sku1)
                            .batchCode("BATCH-2026-001")
                            .transactionType(TransactionType.PURCHASE_RECEIPT)
                            .quantityChange(150)
                            .balanceAfter(150)
                            .referenceId(savedGr.getId().toString())
                            .referenceType("GOODS_RECEIPT")
                            .note("Nhập kho từ phiếu nhập " + savedGr.getReceiptCode())
                            .build();

                    InventoryLedger ledger2 = InventoryLedger.builder()
                            .warehouse(hcmWarehouse)
                            .sku(sku2)
                            .batchCode("BATCH-2026-002")
                            .transactionType(TransactionType.PURCHASE_RECEIPT)
                            .quantityChange(200)
                            .balanceAfter(200)
                            .referenceId(savedGr.getId().toString())
                            .referenceType("GOODS_RECEIPT")
                            .note("Nhập kho từ phiếu nhập " + savedGr.getReceiptCode())
                            .build();

                    inventoryLedgerRepository.saveAll(Arrays.asList(ledger1, ledger2));
                }
            }
        }
    }
}

