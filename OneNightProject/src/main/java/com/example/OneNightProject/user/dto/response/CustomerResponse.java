package com.example.OneNightProject.user.dto.response;

import com.example.OneNightProject.auth.enums.UserEnum;
import com.example.OneNightProject.auth.enums.UserStatusEnum;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.enums.CustomerStatusEnum;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String email;
    private String password;
    private String fullName;
    private String phone;
    CustomerEnum role;
    CustomerStatusEnum status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime deletedAt;
}
