package com.example.OneNightProject.user.repository;

import com.example.OneNightProject.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Users, Long> {
    boolean existsByEmail(String email);
    Users findByEmail(String email);
}
