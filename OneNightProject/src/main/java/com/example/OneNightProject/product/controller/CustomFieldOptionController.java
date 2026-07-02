package com.example.OneNightProject.product.controller;

import com.example.OneNightProject.product.dto.request.CreateCustomFieldOptionRequest;
import com.example.OneNightProject.product.dto.request.SaveCustomizationRequest;
import com.example.OneNightProject.product.dto.request.UpdateCustomFieldOptionRequest;
import com.example.OneNightProject.product.dto.response.CustomFieldOptionResponse;
import com.example.OneNightProject.product.service.CustomFieldOptionService;
import com.example.OneNightProject.product.service.CustomizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/seller/custom-fields")
@RequiredArgsConstructor
public class CustomFieldOptionController {

    private final CustomFieldOptionService optionService;
    private final CustomizationService customizationService;

    @PostMapping("/{fieldId}/options")
    public ResponseEntity<CustomFieldOptionResponse> create(

            @RequestHeader("Authorization")
            String authHeader,

            @PathVariable
            Long fieldId,

            @Valid
            @RequestBody
            CreateCustomFieldOptionRequest request
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)

                .body(

                        optionService.createOption(
                                authHeader,
                                fieldId,
                                request
                        )

                );

    }

    @GetMapping("/{fieldId}/options")
    public ResponseEntity<List<CustomFieldOptionResponse>> getOptions(

            @RequestHeader("Authorization")
            String authHeader,

            @PathVariable
            Long fieldId
    ) {

        return ResponseEntity.ok(

                optionService.getOptions(
                        authHeader,
                        fieldId
                )

        );

    }

    @PutMapping("/options/{optionId}")
    public ResponseEntity<CustomFieldOptionResponse> update(

            @RequestHeader("Authorization")
            String authHeader,

            @PathVariable
            Long optionId,

            @Valid
            @RequestBody
            UpdateCustomFieldOptionRequest request
    ) {

        return ResponseEntity.ok(

                optionService.updateOption(
                        authHeader,
                        optionId,
                        request
                )

        );

    }

    @DeleteMapping("/options/{optionId}")
    public ResponseEntity<Void> delete(

            @RequestHeader("Authorization")
            String authHeader,

            @PathVariable
            Long optionId
    ) {

        optionService.deleteOption(
                authHeader,
                optionId
        );

        return ResponseEntity.noContent().build();

    }

    @PutMapping("/{productId}/customization")
    public ResponseEntity<Void> saveCustomization(

            @RequestHeader("Authorization")
            String authHeader,

            @PathVariable
            Long productId,

            @RequestBody
            SaveCustomizationRequest request
    ){

        customizationService.saveCustomization(
                authHeader,
                productId,
                request
        );

        return ResponseEntity.ok().build();

    }

}
