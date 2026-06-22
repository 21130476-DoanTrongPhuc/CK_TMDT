package com.example.OneNightProject.seller.service.impl;

import com.example.OneNightProject.seller.dto.AdminUserRequest;
import com.example.OneNightProject.seller.service.AdminUserService;
import com.example.OneNightProject.user.dto.response.CustomerResponse;
import com.example.OneNightProject.user.entity.UserProfile;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.enums.CustomerStatusEnum;
import com.example.OneNightProject.user.mapper.CustomerMapper;
import com.example.OneNightProject.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> findAll(CustomerEnum role, CustomerStatusEnum status, String keyword, Pageable pageable) {
        return customerRepository.findAllForAdmin(role, status, keyword, pageable)
                .map(customerMapper::toCustomerResposne);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse findById(Long id) {
        Users user = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return customerMapper.toCustomerResposne(user);
    }

    @Override
    @Transactional
    public CustomerResponse create(AdminUserRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("EMAIL_ALREADY_EXISTS");
        }

        Users user = new Users();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() != null ? request.getRole() : CustomerEnum.USER);
        user.setStatus(CustomerStatusEnum.ACTIVE); // Admin tạo → tự động ACTIVE
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Tạo UserProfile rỗng
        UserProfile profile = new UserProfile();
        user.setUserProfile(profile);

        Users saved = customerRepository.save(user);
        return customerMapper.toCustomerResposne(saved);
    }

    @Override
    @Transactional
    public CustomerResponse update(Long id, AdminUserRequest request) {
        Users user = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        // Chỉ đổi password nếu có truyền vào
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user.setUpdatedAt(LocalDateTime.now());
        Users saved = customerRepository.save(user);
        return customerMapper.toCustomerResposne(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Users user = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setDeletedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(user);
    }
}
