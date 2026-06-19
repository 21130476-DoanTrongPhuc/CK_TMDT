package com.example.OneNightProject.user.repository;

import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.entity.VerificationToken;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VerificationTokenRepository
        extends JpaRepository<VerificationToken, Long> {
    VerificationToken findByToken(String token);
    @Transactional
    @Modifying
    @Query("""
    delete from VerificationToken
    where user.id = :userId
""")
    void deleteByUserId(@Param("userId") Long userId);
}
