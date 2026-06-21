package com.example.OneNightProject.user.repository;

import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.enums.CustomerStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Users, Long> {
    boolean existsByEmail(String email);

    Users findByEmail(String email);

    long countByRole(CustomerEnum role);

    @Query("""
            SELECT u FROM Users u
            WHERE u.deletedAt IS NULL
            AND (:role IS NULL OR u.role = :role)
            AND (:status IS NULL OR u.status = :status)
            AND (:keyword IS NULL OR u.email LIKE %:keyword% OR u.fullName LIKE %:keyword%)
            ORDER BY u.createdAt DESC
            """)
    Page<Users> findAllForAdmin(
            @Param("role") CustomerEnum role,
            @Param("status") CustomerStatusEnum status,
            @Param("keyword") String keyword,
            Pageable pageable);
}
