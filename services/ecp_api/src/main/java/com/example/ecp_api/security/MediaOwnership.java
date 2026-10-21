package com.example.ecp_api.security;

import com.example.ecp_api.entity.mongodb.*;
import com.example.ecp_api.repository.jpa.UserRepository;
import com.example.ecp_api.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

/** Keep shared assets when a manager deletes their own record referencing another owner's file. */
@Component
@org.springframework.transaction.annotation.Transactional(readOnly = true)
@RequiredArgsConstructor
public class MediaOwnership {
    private final MongoTemplate mongo;
    private final UserRepository users;

    public boolean canDelete(String identifier) {
        if (identifier == null || identifier.isBlank()) { return false; }
        if (archivedReference(Product.class, identifier, "thumbnail.url", "thumbnail.publicId", "images.url", "images.publicId", "videos.url", "videos.publicId", "variants.image.url", "variants.image.publicId")
                || archivedReference(Category.class, identifier, "image.url", "image.publicId")
                || archivedReference(Brand.class, identifier, "logo")) { return false; }
        if (!DataOwnership.restricted()) { return true; }
        if (foreignReference(Product.class, identifier, "thumbnail.url", "thumbnail.publicId", "images.url", "images.publicId", "videos.url", "videos.publicId", "variants.image.url", "variants.image.publicId")
                || foreignReference(Category.class, identifier, "image.url", "image.publicId")
                || foreignReference(Brand.class, identifier, "logo")) { return false; }
        return users.findAll((root, query, cb) -> {
            var profile = root.join("profile", jakarta.persistence.criteria.JoinType.LEFT);
            return cb.or(cb.equal(profile.get("avatarUrl"), identifier), cb.equal(profile.get("avatarPublicId"), identifier),
                    cb.equal(profile.get("bannerUrl"), identifier), cb.equal(profile.get("bannerPublicId"), identifier));
        }).stream().allMatch(user -> user.getEmail().equalsIgnoreCase(SecurityUtils.getCurrentUserEmail())
                || user.getCreatedBy() != null && DataOwnership.visible(user.getCreatedBy().getEmail()));
    }

    public void requireManagedFile(String value) {
        if (SecurityUtils.isSuperAdmin()) { return; }
        if (!DataOwnership.restricted() || value == null || value.isBlank() || !canDelete(value)) {
            throw new com.example.ecp_api.exception.AppException("DATA_ACCESS_DENIED", "Bạn không có quyền xoá file này.", org.springframework.http.HttpStatus.FORBIDDEN);
        }
        boolean own = ownedReference(Product.class, value, "thumbnail.url", "thumbnail.publicId", "images.url", "images.publicId", "videos.url", "videos.publicId", "variants.image.url", "variants.image.publicId")
                || ownedReference(Category.class, value, "image.url", "image.publicId") || ownedReference(Brand.class, value, "logo");
        if (!own) {
            own = users.findAll((root, query, cb) -> {
                var profile = root.join("profile", jakarta.persistence.criteria.JoinType.LEFT);
                return cb.or(cb.equal(profile.get("avatarUrl"), value), cb.equal(profile.get("avatarPublicId"), value),
                        cb.equal(profile.get("bannerUrl"), value), cb.equal(profile.get("bannerPublicId"), value));
            }).stream().anyMatch(user -> user.getEmail().equalsIgnoreCase(SecurityUtils.getCurrentUserEmail())
                    || user.getCreatedBy() != null && DataOwnership.visible(user.getCreatedBy().getEmail()));
        }
        if (!own) { throw new com.example.ecp_api.exception.AppException("DATA_ACCESS_DENIED", "File không thuộc dữ liệu của bạn.", org.springframework.http.HttpStatus.FORBIDDEN); }
    }

    private boolean archivedReference(Class<?> type, String value, String... fields) {
        java.util.List<Criteria> references = new java.util.ArrayList<>();
        for (String field : fields) { references.add(Criteria.where(field).is(value)); }
        if (type == Product.class) { references.add(Criteria.where("description").regex(java.util.regex.Pattern.quote(value))); }
        return mongo.exists(Query.query(new Criteria().andOperator(Criteria.where("is_deleted").is(true),
                new Criteria().orOperator(references.toArray(new Criteria[0])))), type);
    }

    private boolean ownedReference(Class<?> type, String value, String... fields) {
        Criteria[] references = java.util.Arrays.stream(fields).map(field -> Criteria.where(field).is(value)).toArray(Criteria[]::new);
        return mongo.exists(DataOwnership.mongo(Query.query(new Criteria().orOperator(references))), type);
    }

    private boolean foreignReference(Class<?> type, String value, String... fields) {
        Criteria[] references = java.util.Arrays.stream(fields).map(field -> Criteria.where(field).is(value)).toArray(Criteria[]::new);
        java.util.List<Criteria> matches = new java.util.ArrayList<>(java.util.List.of(references));
        if (type == Product.class) { matches.add(Criteria.where("description").regex(java.util.regex.Pattern.quote(value))); }
        Query query = Query.query(new Criteria().andOperator(
                Criteria.where("createdBy").nin(SecurityUtils.getCurrentUserEmail(), DataOwnership.legacyOwnerPattern()),
                new Criteria().orOperator(matches.toArray(new Criteria[0]))));
        return mongo.exists(query, type);
    }
}
