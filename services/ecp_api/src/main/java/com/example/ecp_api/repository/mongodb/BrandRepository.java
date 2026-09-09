package com.example.ecp_api.repository.mongodb;

import com.example.ecp_api.entity.mongodb.Brand;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface BrandRepository extends MongoRepository<Brand, String> {

    Optional<Brand> findBySlugAndDeletedFalse(String slug);

    Optional<Brand> findByNameAndDeletedFalse(String name);

    boolean existsByNameAndDeletedFalse(String name);

    boolean existsBySlugAndDeletedFalse(String slug);

    boolean existsByNameAndIdNotAndDeletedFalse(String name, String id);

    boolean existsBySlugAndIdNotAndDeletedFalse(String slug, String id);

    List<Brand> findByActiveTrueAndDeletedFalse();

    @Query("{ 'is_deleted' : false }")
    Stream<Brand> findAllByDeletedFalse();
}
