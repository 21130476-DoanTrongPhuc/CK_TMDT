package com.example.OneNightProject.user.dto.request;

import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.enums.CustomerStatusEnum;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {
    private String email;
    private String password;
}
