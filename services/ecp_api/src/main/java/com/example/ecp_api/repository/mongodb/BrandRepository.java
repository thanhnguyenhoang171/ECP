package com.example.ecp_api.repository.mongodb;

import com.example.ecp_api.entity.mongodb.Brand;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends MongoRepository<Brand, String> {

    Optional<Brand> findBySlugAndDeletedFalse(String slug);

    boolean existsByNameAndDeletedFalse(String name);

    boolean existsBySlugAndDeletedFalse(String slug);

    boolean existsByNameAndIdNotAndDeletedFalse(String name, String id);

    boolean existsBySlugAndIdNotAndDeletedFalse(String slug, String id);

    List<Brand> findByActiveTrueAndDeletedFalse();
}
