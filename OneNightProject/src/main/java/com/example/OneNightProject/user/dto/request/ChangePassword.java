package com.example.OneNightProject.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePassword {
    private String currentPassword;

    private String newPassword;

    private String confirmPassword;
}
