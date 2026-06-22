package com.example.OneNightProject.product.repository;

import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends
        JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {
    @Query("""
                SELECT p FROM Product p
                WHERE p.id = :idProduct
            """)
    Product findByProductId(Long idProduct);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.seller.id = :sellerId")
    long countBySellerId(@Param("sellerId") Long sellerId);

    Page<Product> findBySellerIdAndDeleteAtIsNull(Long sellerId, Pageable pageable);

    long countByStatus(ProductStatus status);

    @Query("""
            SELECT p FROM Product p
            WHERE p.deleteAt IS NULL
            AND (:status IS NULL OR p.status = :status)
            AND (:keyword IS NULL OR p.name LIKE %:keyword% OR p.seller.fullName LIKE %:keyword%)
            ORDER BY p.createdAt DESC
            """)
    Page<Product> findAllForAdmin(
            @Param("status") ProductStatus status,
            @Param("keyword") String keyword,
            Pageable pageable);
}
