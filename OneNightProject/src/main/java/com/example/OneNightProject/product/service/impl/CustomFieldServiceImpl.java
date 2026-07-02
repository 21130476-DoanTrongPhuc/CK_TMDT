package com.example.OneNightProject.product.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.product.dto.request.CreateCustomFieldRequest;
import com.example.OneNightProject.product.dto.request.UpdateCustomFieldRequest;
import com.example.OneNightProject.product.dto.response.CustomFieldResponse;
import com.example.OneNightProject.product.entity.CustomField;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.mapper.CustomFieldMapper;
import com.example.OneNightProject.product.repository.CustomFieldRepository;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.product.service.CustomFieldService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomFieldServiceImpl implements CustomFieldService {

    private final CustomerRepository userRepository;

    private final ProductRepository productRepository;

    private final CustomFieldRepository customFieldRepository;

    private final CustomFieldMapper customFieldMapper;

    private final JwtService jwtService;

    private Long getSellerId(String authHeader) {

        String token = authHeader.replace("Bearer ", "");

        Users users = userRepository.findByEmail(jwtService.extractUsername(token));

        if(users.getRole().equals(CustomerEnum.SELLER)){
            return users.getId();
        }

        return null;
    }

    private Product getSellerProduct(
            Long productId,
            Long sellerId
    ) {

        return productRepository
                .findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "Bạn không có quyền thao tác sản phẩm này"
                        ));
    }

    private CustomField getSellerField(
            Long fieldId,
            Long sellerId
    ) {

        return customFieldRepository
                .findByIdAndProductSellerId(fieldId, sellerId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Không tìm thấy custom field"
                        ));
    }

    @Override
    public CustomFieldResponse createField(
            String authHeader,
            Long productId,
            CreateCustomFieldRequest request
    ) {

        Long sellerId = getSellerId(authHeader);

        Product product = getSellerProduct(
                productId,
                sellerId
        );

        CustomField field = CustomField.builder()

                .product(product)

                .name(request.getName())

                .description(request.getDescription())

                .fieldType(request.getFieldType())

                .required(request.getRequired())

                .placeholder(request.getPlaceholder())

                .minLength(request.getMinLength())

                .maxLength(request.getMaxLength())

                .sortOrder(
                        request.getSortOrder() == null
                                ? nextSortOrder(productId)
                                : request.getSortOrder()
                )


                .active(true)

                .createdAt(LocalDateTime.now())

                .updatedAt(LocalDateTime.now())

                .build();

        validateField(request);

        customFieldRepository.save(field);

        return customFieldMapper.toResponse(field);
    }

    @Override
    public CustomFieldResponse updateField(
            String authHeader,
            Long fieldId,
            UpdateCustomFieldRequest request
    ) {

        Long sellerId = getSellerId(authHeader);

        CustomField field = getSellerField(
                fieldId,
                sellerId
        );

        field.setName(request.getName());

        field.setDescription(request.getDescription());

        field.setFieldType(request.getFieldType());

        field.setRequired(request.getRequired());

        field.setPlaceholder(request.getPlaceholder());

        field.setMinLength(request.getMinLength());

        field.setMaxLength(request.getMaxLength());

        field.setSortOrder(request.getSortOrder());

        field.setActive(request.getActive());

        field.setUpdatedAt(LocalDateTime.now());

        customFieldRepository.save(field);

        return customFieldMapper.toResponse(field);
    }

    private void validateField(CreateCustomFieldRequest request) {

        if (request.getFieldType() == null) {
            throw new IllegalArgumentException("Loại trường không được để trống");
        }

        if (Boolean.TRUE.equals(request.getRequired())
                && request.getName().isBlank()) {
            throw new IllegalArgumentException("Tên trường không hợp lệ");
        }

        if (request.getMinLength() != null
                && request.getMaxLength() != null
                && request.getMinLength() > request.getMaxLength()) {

            throw new IllegalArgumentException(
                    "minLength không được lớn hơn maxLength"
            );
        }

        switch (request.getFieldType()) {

            case SELECT:
            case RADIO:
            case CHECKBOX:

                if (request.getPlaceholder() != null) {

                    throw new IllegalArgumentException(
                            "Select/Radio/Checkbox không sử dụng placeholder"
                    );

                }

                break;

            case TEXT:
            case TEXTAREA:

                break;
        }

    }

    private void validateField(UpdateCustomFieldRequest request) {

        if (request.getFieldType() == null) {
            throw new IllegalArgumentException("Loại trường không hợp lệ");
        }

        if (request.getMinLength() != null
                && request.getMaxLength() != null
                && request.getMinLength() > request.getMaxLength()) {

            throw new IllegalArgumentException(
                    "minLength phải nhỏ hơn maxLength"
            );
        }

    }

    private Integer nextSortOrder(Long productId) {

        Integer value = customFieldRepository
                .findMaxSortOrder(productId);

        if (value == null) {
            return 1;
        }

        return value + 1;

    }

    @Override
    public void deleteField(
            String authHeader,
            Long fieldId
    ) {

        Long sellerId = getSellerId(authHeader);

        CustomField field = getSellerField(
                fieldId,
                sellerId
        );

        customFieldRepository.delete(field);

    }

    @Override
    @Transactional
    public List<CustomFieldResponse> getFields(
            String authHeader,
            Long productId
    ) {

        Long sellerId = getSellerId(authHeader);

        getSellerProduct(
                productId,
                sellerId
        );

        return customFieldRepository

                .findByProductIdOrderBySortOrder(productId)

                .stream()

                .map(customFieldMapper::toResponse)

                .toList();

    }

    private boolean canHaveOption(CustomField field) {

        return switch (field.getFieldType()) {

            case SELECT,
                 RADIO,
                 CHECKBOX -> true;

            default -> false;

        };

    }

    private boolean isTextField(CustomField field) {

        return switch (field.getFieldType()) {

            case TEXT,
                 TEXTAREA -> true;

            default -> false;

        };

    }



}
