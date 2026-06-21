package com.example.OneNightProject.auth.repository;

import com.example.OneNightProject.auth.entity.OauthAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OauthAccountRepository extends JpaRepository<OauthAccount, Long> {
}
