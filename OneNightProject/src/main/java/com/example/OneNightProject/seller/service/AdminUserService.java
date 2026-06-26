package com.example.OneNightProject.seller.service;

import com.example.OneNightProject.user.dto.response.CustomerResponse;
import com.example.OneNightProject.seller.dto.AdminUserRequest;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.enums.CustomerStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminUserService {
    Page<CustomerResponse> findAll(CustomerEnum role, CustomerStatusEnum status, String keyword, Pageable pageable);
    CustomerResponse findById(Long id);
    CustomerResponse create(AdminUserRequest request);
    CustomerResponse update(Long id, AdminUserRequest request);
    void delete(Long id);
}
