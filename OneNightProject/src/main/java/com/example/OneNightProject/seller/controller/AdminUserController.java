package com.example.OneNightProject.seller.controller;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.seller.dto.AdminUserRequest;
import com.example.OneNightProject.seller.service.AdminUserService;
import com.example.OneNightProject.user.dto.response.CustomerResponse;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.enums.CustomerStatusEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;
    private final AdminUserService adminUserService;

    private Users getAdmin(String authHeader) {
        String token = authHeader.substring(7);
        Users user = customerRepository.findByEmail(jwtService.extractUsername(token));
        if (user == null || user.getRole() != CustomerEnum.ADMIN) {
            return null;
        }
        return user;
    }

    /**
     * Lấy tất cả user (phân trang + filter role/status + tìm kiếm)
     */
    @GetMapping
    public ResponseEntity<Page<CustomerResponse>> list(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) CustomerEnum role,
            @RequestParam(required = false) CustomerStatusEnum status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(adminUserService.findAll(role, status, keyword, pageable));
    }

    /**
     * Chi tiết user
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(adminUserService.findById(id));
    }

    /**
     * Tạo user mới (admin tạo → tự động ACTIVE)
     */
    @PostMapping
    public ResponseEntity<CustomerResponse> create(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody AdminUserRequest request) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(adminUserService.create(request));
    }

    /**
     * Cập nhật user
     */
    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> update(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody AdminUserRequest request) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(adminUserService.update(id, request));
    }

    /**
     * Soft delete user
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        adminUserService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
