package com.example.OneNightProject.product.controller;

import com.example.OneNightProject.product.dto.request.CreateCustomFieldRequest;
import com.example.OneNightProject.product.dto.request.UpdateCustomFieldRequest;
import com.example.OneNightProject.product.dto.response.CustomFieldResponse;
import com.example.OneNightProject.product.dto.response.CustomizationResponse;
import com.example.OneNightProject.product.service.CustomFieldService;
import com.example.OneNightProject.product.service.CustomizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/seller/products")
@RequiredArgsConstructor
public class CustomFieldController {

    private final CustomFieldService customFieldService;
    private final CustomizationService customizationService;

    @PostMapping("/{productId}/custom-fields")
    public ResponseEntity<CustomFieldResponse> createField(

            @RequestHeader("Authorization")
            String authHeader,

            @PathVariable
            Long productId,

            @Valid
            @RequestBody
            CreateCustomFieldRequest request
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)

                .body(

                        customFieldService.createField(
                                authHeader,
                                productId,
                                request
                        )

                );

    }

    @GetMapping("/{productId}/custom-fields")
    public ResponseEntity<List<CustomFieldResponse>> getFields(

            @RequestHeader("Authorization")
            String authHeader,

            @PathVariable
            Long productId
    ) {

        return ResponseEntity.ok(

                customFieldService.getFields(
                        authHeader,
                        productId
                )

        );

    }

    @PutMapping("/custom-fields/{fieldId}")
    public ResponseEntity<CustomFieldResponse> updateField(

            @RequestHeader("Authorization")
            String authHeader,

            @PathVariable
            Long fieldId,

            @Valid
            @RequestBody
            UpdateCustomFieldRequest request
    ) {

        return ResponseEntity.ok(

                customFieldService.updateField(
                        authHeader,
                        fieldId,
                        request
                )

        );

    }

    @DeleteMapping("/custom-fields/{fieldId}")
    public ResponseEntity<Void> deleteField(

            @RequestHeader("Authorization")
            String authHeader,

            @PathVariable
            Long fieldId
    ) {

        customFieldService.deleteField(
                authHeader,
                fieldId
        );

        return ResponseEntity.noContent().build();

    }


    @GetMapping("/{productId}/customization")
    public ResponseEntity<CustomizationResponse> getCustomization(

            @RequestHeader("Authorization")
            String authHeader,

            @PathVariable
            Long productId
    ) {

        return ResponseEntity.ok(

                customizationService.getCustomization(
                        authHeader,
                        productId
                )

        );

    }
}
