package com.example.OneNightProject.user.controller;

import com.example.OneNightProject.user.dto.request.ChangePassword;
import com.example.OneNightProject.user.dto.request.CustomerRequest;
import com.example.OneNightProject.user.dto.request.ResetPasswordRequest;
import com.example.OneNightProject.user.dto.response.CustomerResponse;
import com.example.OneNightProject.user.dto.response.ResponsePasswordReset;
import com.example.OneNightProject.user.entity.VerificationToken;
import com.example.OneNightProject.user.service.CustomerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/customers")
public class CustomerController {
    @Autowired
    private CustomerService customerService;


    @PostMapping()
    public ResponseEntity<CustomerResponse> register(@RequestBody CustomerRequest request){
        return ResponseEntity.ok(customerService.register(request));
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<ResponsePasswordReset> resetPassword(@RequestBody ResetPasswordRequest request){
        return ResponseEntity.ok(customerService.resetPassword(request));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<CustomerResponse> getByUsername(@PathVariable("username") String username){
        return ResponseEntity.ok(customerService.getByUsername(username));
    }

    @PutMapping("/change-password")
    public ResponseEntity<CustomerResponse> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody ChangePassword request
    ){
        return ResponseEntity.ok(
                customerService.changePassword(
                        token,
                        request
                )
        );
    }
}
