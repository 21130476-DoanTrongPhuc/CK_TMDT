package com.example.OneNightProject.product.repository;

import com.example.OneNightProject.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends
        JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {
    @Query(
            """
                SELECT p FROM Product p 
                WHERE p.id = :idProduct
            """
    )
    Product findByProductId(Long idProduct);

    List<Product> findBySeller_IdAndDeleteAtIsNullOrderByCreatedAtDesc(Long sellerId);

    List<Product> findBySeller_IdAndAllowCustomizationTrueAndDeleteAtIsNullOrderByCreatedAtDesc(Long sellerId);
}
