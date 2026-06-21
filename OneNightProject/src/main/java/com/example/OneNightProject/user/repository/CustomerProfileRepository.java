package com.example.OneNightProject.user.repository;

import com.example.OneNightProject.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerProfileRepository extends JpaRepository<UserProfile, Long> {

    UserProfile findByUserId(Long id);
}
