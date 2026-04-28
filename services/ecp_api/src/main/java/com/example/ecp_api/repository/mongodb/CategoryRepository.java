package com.example.ecp_api.repository.mongodb;

import com.example.ecp_api.entity.mongodb.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findBySlug(String slug);
    boolean existsBySlugAndDeletedFalse(String slug);
    boolean existsByParentIdAndDeletedFalse(String parentId);
    Page<Category> findByDeletedFalse(Pageable pageable);
    List<Category> findByParentIdIsNullAndDeletedFalse();
    
    @org.springframework.data.mongodb.repository.Query("{ 'is_deleted' : false }")
    Stream<Category> findAllByDeletedFalse();
}
