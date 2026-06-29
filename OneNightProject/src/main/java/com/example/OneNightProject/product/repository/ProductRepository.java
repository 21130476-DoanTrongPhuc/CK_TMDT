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

import java.util.List;

@Repository
public interface ProductRepository extends
        JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    @Query("""
            SELECT p
            FROM Product p
            WHERE p.id = :idProduct
            """)
    Product findByProductId(
            @Param("idProduct") Long idProduct);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.seller.id = :sellerId")
    long countBySellerId(@Param("sellerId") Long sellerId);

    List<Product> findBySeller_IdAndDeleteAtIsNullOrderByCreatedAtDesc(
            Long sellerId);

    List<Product> findBySeller_IdAndAllowCustomizationTrueAndDeleteAtIsNullOrderByCreatedAtDesc(
            Long sellerId);

    Page<Product> findBySellerIdAndDeleteAtIsNull(
            Long sellerId,
            Pageable pageable);

    List<Product> findByCategory_Id(Long categoryId, Pageable pageable);

    long countByStatus(
            ProductStatus status);

    @Query("""
            SELECT p
            FROM Product p
            WHERE p.deleteAt IS NULL
              AND (:status IS NULL OR p.status = :status)
              AND (
                    :keyword IS NULL
                    OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(p.seller.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  )
            ORDER BY p.createdAt DESC
            """)
    Page<Product> findAllForAdmin(
            @Param("status") ProductStatus status,
            @Param("keyword") String keyword,
            Pageable pageable);
}