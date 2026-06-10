package com.example.OneNightProject.user.service;

import com.example.OneNightProject.user.dto.request.ChangePassword;
import com.example.OneNightProject.user.dto.request.CustomerRequest;
import com.example.OneNightProject.user.dto.request.ResetPasswordRequest;
import com.example.OneNightProject.user.dto.response.CustomerResponse;
import com.example.OneNightProject.user.dto.response.ResponsePasswordReset;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public interface CustomerService {
    CustomerResponse register(CustomerRequest request);

    ResponsePasswordReset resetPassword(ResetPasswordRequest request);

    CustomerResponse getByUsername(String username);

    CustomerResponse changePassword(String token, ChangePassword request);
}
