package com.example.OneNightProject.seller.dto;

import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.enums.CustomerStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserRequest {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private CustomerEnum role;
    private CustomerStatusEnum status;
}
