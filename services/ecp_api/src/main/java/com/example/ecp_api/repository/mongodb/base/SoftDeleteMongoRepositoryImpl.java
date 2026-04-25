package com.example.ecp_api.repository.mongodb.base;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.repository.query.MongoEntityInformation;
import org.springframework.data.mongodb.repository.support.SimpleMongoRepository;

import java.io.Serializable;
import java.util.List;

public class SoftDeleteMongoRepositoryImpl<T, ID extends Serializable> 
    extends SimpleMongoRepository<T, ID> implements SoftDeleteMongoRepository<T, ID> {

    private final MongoOperations mongoOperations;
    private final MongoEntityInformation<T, ID> entityInformation;

    public SoftDeleteMongoRepositoryImpl(MongoEntityInformation<T, ID> entityInformation, MongoOperations mongoOperations) {
        super(entityInformation, mongoOperations);
        this.mongoOperations = mongoOperations;
        this.entityInformation = entityInformation;
    }

    @Override
    public List<T> findAllActive() {
        return mongoOperations.find(
            new Query(Criteria.where("deleted").is(false)), 
            entityInformation.getJavaType()
        );
    }

    @Override
    public Page<T> findAllActive(Pageable pageable) {
        Query query = new Query(Criteria.where("deleted").is(false)).with(pageable);
        List<T> list = mongoOperations.find(query, entityInformation.getJavaType());
        long count = mongoOperations.count(new Query(Criteria.where("deleted").is(false)), entityInformation.getJavaType());
        return new PageImpl<>(list, pageable, count);
    }
}
