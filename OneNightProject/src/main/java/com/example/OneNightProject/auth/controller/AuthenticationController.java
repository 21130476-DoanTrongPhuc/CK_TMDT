package com.example.OneNightProject.auth.controller;

import com.example.OneNightProject.auth.dto.request.AuthenticationRequest;
import com.example.OneNightProject.auth.dto.response.AuthenticationResponse;
import com.example.OneNightProject.auth.service.AuthenticationService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request){
        try {
            return ResponseEntity.ok(authenticationService.authenticate(request));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/verify")
    public void verifyAccount(@RequestParam String token, HttpServletResponse response) throws IOException {
        authenticationService.verifyAccount(response,token);
    }

    @GetMapping("/success")
    public ResponseEntity<AuthenticationResponse> success(
            @AuthenticationPrincipal OAuth2User oauth2User,
            Authentication authentication
    ) {
        return ResponseEntity.ok(authenticationService.socialLogin(oauth2User, authentication));
    }

}
