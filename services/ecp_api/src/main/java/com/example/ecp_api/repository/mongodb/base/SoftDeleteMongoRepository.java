package com.example.ecp_api.repository.mongodb.base;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.io.Serializable;
import java.util.List;

@NoRepositoryBean
public interface SoftDeleteMongoRepository<T, ID extends Serializable> extends MongoRepository<T, ID> {
    List<T> findAllActive();
    Page<T> findAllActive(Pageable pageable);
}
