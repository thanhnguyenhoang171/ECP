package com.example.ecp_api.config;

import com.example.ecp_api.entity.jpa.*;
import com.example.ecp_api.entity.mongodb.*;
import com.example.ecp_api.entity.mongodb.embedded.ProductImage;
import com.example.ecp_api.entity.mongodb.embedded.ProductVariant;
import com.example.ecp_api.enums.users.AuthProvider;
import com.example.ecp_api.enums.users.MembershipTier;
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

@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final SkuRepository skuRepository;
    private final InventoryRepository inventoryRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting system data initialization...");
        initializeUsers();
        initializeSuppliers();
        initializeWarehouses();
        initializeBrandsAndCategoriesAndProducts();
        log.info("System data initialization completed successfully!");
    }

    public void initializeDefaults() {
        try {
            initializeUsers();
            initializeSuppliers();
            initializeWarehouses();
            initializeBrandsAndCategoriesAndProducts();
        } catch (Exception e) {
            log.error("Error during manual data initialization", e);
        }
    }

    private void initializeUsers() {
        // Super Admin
        String adminEmail = "admin@ecp.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            log.info("Seeding Super Admin account...");
            User admin = User.builder()
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(UserRole.SUPER_ADMIN)
                    .provider(AuthProvider.LOCAL)
                    .active(true)
                    .emailVerified(true)
                    .build();

            UserProfile profile = UserProfile.builder()
                    .user(admin)
                    .firstName("Quản trị")
                    .lastName("Viên")
                    .phoneNumber("0912345678")
                    .membershipTier(MembershipTier.MEMBER)
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
                    .role(UserRole.MANAGER)
                    .provider(AuthProvider.LOCAL)
                    .active(true)
                    .emailVerified(true)
                    .build();

            UserProfile profile = UserProfile.builder()
                    .user(manager)
                    .firstName("Quản Lý")
                    .lastName("Kho")
                    .phoneNumber("0987654321")
                    .membershipTier(MembershipTier.MEMBER)
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
                    .role(UserRole.USER)
                    .provider(AuthProvider.LOCAL)
                    .active(true)
                    .emailVerified(true)
                    .build();

            UserProfile profile = UserProfile.builder()
                    .user(user)
                    .firstName("Khách Hàng")
                    .lastName("Thân Thiết")
                    .phoneNumber("0905123456")
                    .membershipTier(MembershipTier.SILVER)
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
            List<Brand> brands = brandRepository.findAll();
            if (!brands.isEmpty()) bVinacacao = brands.get(0);
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
            List<Category> categories = categoryRepository.findAll();
            if (!categories.isEmpty()) cPure = categories.get(0);
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
}
