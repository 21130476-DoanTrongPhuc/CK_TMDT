package com.example.OneNightProject.product.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.product.dto.request.CustomFieldOptionRequest;
import com.example.OneNightProject.product.dto.request.CustomFieldRequest;
import com.example.OneNightProject.product.dto.request.SaveCustomizationRequest;
import com.example.OneNightProject.product.dto.response.CustomFieldOptionResponse;
import com.example.OneNightProject.product.dto.response.CustomFieldResponse;
import com.example.OneNightProject.product.dto.response.CustomizationResponse;
import com.example.OneNightProject.product.entity.CustomField;
import com.example.OneNightProject.product.entity.CustomFieldOption;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.enums.CustomFieldType;
import com.example.OneNightProject.product.mapper.CustomFieldOptionMapper;
import com.example.OneNightProject.product.repository.CustomFieldOptionRepository;
import com.example.OneNightProject.product.repository.CustomFieldRepository;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.product.service.CustomizationService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomizationServiceImpl
        implements CustomizationService {

    private final CustomFieldRepository customFieldRepository;

    private final CustomFieldOptionMapper optionMapper;

    private final CustomerRepository userReposiroty;

    private final JwtService jwtService;

    private final ProductRepository productRepository;

    private final CustomFieldRepository fieldRepository;

    private final CustomFieldOptionRepository optionRepository;

    private Long getSellerId(String authHeader) {

        String token = authHeader.replace("Bearer ", "");

        Users users = userReposiroty.findByEmail(jwtService.extractUsername(token));

        if(users.getRole().equals(CustomerEnum.SELLER)){
            return users.getId();
        }

        return null;

    }

    private Product getProduct(

            Long sellerId,

            Long productId
    ){

        return productRepository

                .findByIdAndSellerId(
                        productId,
                        sellerId
                )

                .orElseThrow(()->
                        new AccessDeniedException(
                                "Bạn không có quyền"
                        )
                );

    }

    @Override
    public void saveCustomization(

            String authHeader,

            Long productId,

            SaveCustomizationRequest request
    ) {

        Long sellerId =
                getSellerId(authHeader);

        Product product =
                getProduct(
                        sellerId,
                        productId
                );

        List<CustomField> dbFields =
                fieldRepository
                        .findByProductIdOrderBySortOrder(
                                productId
                        );

        syncFields(

                product,

                dbFields,

                request.getFields()

        );

    }

    @Override
    @Transactional
    public CustomizationResponse getCustomization(
            String authHeader,
            Long productId
    ) {

        Users seller = userReposiroty.findById(getSellerId(authHeader)).orElseThrow();

        Product product =
                productRepository
                        .findById(productId)
                        .orElseThrow(() ->
                                new RuntimeException("Product not found"));

        if (!product.getSeller().getId().equals(seller.getId())) {

            throw new RuntimeException("Bạn không sở hữu sản phẩm này");

        }

        List<CustomField> fields =
                customFieldRepository
                        .findByProductIdOrderBySortOrder(productId);

        return CustomizationResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .fields(
                        fields.stream()
                                .map(this::toFieldResponse)
                                .toList()
                )
                .build();
    }

    private CustomFieldResponse toFieldResponse(
            CustomField field
    ) {

        return CustomFieldResponse.builder()

                .id(field.getId())

                .name(field.getName())

                .description(field.getDescription())

                .fieldType(field.getFieldType())

                .required(field.getRequired())

                .placeholder(field.getPlaceholder())

                .minLength(field.getMinLength())

                .maxLength(field.getMaxLength())

                .sortOrder(field.getSortOrder())

                .active(field.getActive())

                .options(
                        field.getOptions()
                                .stream()
                                .sorted(
                                        Comparator.comparing(
                                                CustomFieldOption::getSortOrder,
                                                Comparator.nullsLast(
                                                        Integer::compareTo
                                                )
                                        )
                                )
                                .map(this::toOptionResponse)
                                .toList()
                )

                .build();

    }

    private CustomFieldOptionResponse toOptionResponse(
            CustomFieldOption option
    ) {

        return CustomFieldOptionResponse.builder()

                .id(option.getId())

                .label(option.getLabel())

                .value(option.getValue())

                .extraPrice(option.getExtraPrice())

                .imageUrl(option.getImageUrl())

                .sortOrder(option.getSortOrder())

                .active(option.getActive())

                .build();

    }

    private void syncFields(

            Product product,

            List<CustomField> dbFields,

            List<CustomFieldRequest> requestFields
    ) {

        if (requestFields == null) {
            requestFields = Collections.emptyList();
        }

        Map<Long, CustomField> dbFieldMap =

                dbFields.stream()

                        .collect(

                                Collectors.toMap(

                                        CustomField::getId,

                                        Function.identity()

                                )

                        );

        Set<Long> requestIds = new HashSet<>();

        for (CustomFieldRequest request : requestFields) {

            if (request.getId() == null) {

                insertField(product, request);

            } else {

                requestIds.add(request.getId());

                updateField(

                        dbFieldMap.get(request.getId()),

                        request

                );

            }

        }

        deleteRemovedFields(

                dbFields,

                requestIds

        );

    }

    private void insertField(

            Product product,

            CustomFieldRequest request
    ) {

        CustomField field = CustomField.builder()

                .product(product)

                .name(request.getName())

                .description(request.getDescription())

                .fieldType(request.getFieldType())

                .required(request.getRequired())

                .placeholder(request.getPlaceholder())

                .minLength(request.getMinLength())

                .maxLength(request.getMaxLength())

                .sortOrder(request.getSortOrder())

                .active(

                        request.getActive() == null

                                ? true

                                : request.getActive()

                )

                .createdAt(LocalDateTime.now())

                .updatedAt(LocalDateTime.now())

                .build();

        fieldRepository.save(field);

        syncOptions(

                field,

                Collections.emptyList(),

                request.getOptions()

        );

    }

    private void updateField(

            CustomField field,

            CustomFieldRequest request
    ) {

        if (field == null) {

            throw new EntityNotFoundException(
                    "Custom Field không tồn tại"
            );

        }

        field.setName(request.getName());

        field.setDescription(request.getDescription());

        field.setRequired(request.getRequired());

        field.setPlaceholder(request.getPlaceholder());

        field.setMinLength(request.getMinLength());

        field.setMaxLength(request.getMaxLength());

        field.setSortOrder(request.getSortOrder());

        field.setActive(request.getActive());

        field.setUpdatedAt(LocalDateTime.now());

        fieldRepository.save(field);

        List<CustomFieldOption> dbOptions =

                optionRepository

                        .findByFieldIdOrderBySortOrder(
                                field.getId()
                        );

        syncOptions(

                field,

                dbOptions,

                request.getOptions()

        );

    }

    private void deleteRemovedFields(

            List<CustomField> dbFields,

            Set<Long> requestIds
    ) {

        for (CustomField field : dbFields) {

            if (!requestIds.contains(field.getId())) {

                fieldRepository.delete(field);

            }

        }

    }

    private void syncOptions(

            CustomField field,

            List<CustomFieldOption> dbOptions,

            List<CustomFieldOptionRequest> requestOptions
    ) {

        if (requestOptions == null) {
            requestOptions = Collections.emptyList();
        }

        /*
         * TEXT và TEXTAREA không được phép có Option
         */
        if (field.getFieldType() == CustomFieldType.TEXT
                || field.getFieldType() == CustomFieldType.TEXTAREA) {

            optionRepository.deleteAll(dbOptions);

            return;
        }

        Map<Long, CustomFieldOption> dbOptionMap =

                dbOptions.stream()

                        .collect(

                                Collectors.toMap(

                                        CustomFieldOption::getId,

                                        Function.identity()

                                )

                        );

        Set<Long> requestIds = new HashSet<>();

        for (CustomFieldOptionRequest request : requestOptions) {

            if (request.getId() == null) {

                insertOption(field, request);

            } else {

                requestIds.add(request.getId());

                updateOption(

                        dbOptionMap.get(request.getId()),

                        request

                );

            }

        }

        deleteRemovedOptions(

                dbOptions,

                requestIds

        );

    }

    private void insertOption(

            CustomField field,

            CustomFieldOptionRequest request
    ) {

        CustomFieldOption option = CustomFieldOption.builder()

                .field(field)

                .label(request.getLabel())

                .value(request.getValue())

                .extraPrice(
                        request.getExtraPrice()
                )

                .imageUrl(
                        request.getImageUrl()
                )

                .sortOrder(
                        request.getSortOrder()
                )

                .active(
                        request.getActive() == null
                                ? true
                                : request.getActive()
                )

                .createdAt(LocalDateTime.now())

                .updatedAt(LocalDateTime.now())

                .build();

        optionRepository.save(option);

    }

    private void updateOption(

            CustomFieldOption option,

            CustomFieldOptionRequest request
    ) {

        if (option == null) {

            throw new EntityNotFoundException(
                    "Option không tồn tại"
            );

        }

        option.setLabel(request.getLabel());

        option.setValue(request.getValue());

        option.setExtraPrice(request.getExtraPrice());

        option.setImageUrl(request.getImageUrl());

        option.setSortOrder(request.getSortOrder());

        option.setActive(request.getActive());

        option.setUpdatedAt(LocalDateTime.now());

        optionRepository.save(option);

    }

    private void deleteRemovedOptions(

            List<CustomFieldOption> dbOptions,

            Set<Long> requestIds
    ) {

        for (CustomFieldOption option : dbOptions) {

            if (!requestIds.contains(option.getId())) {

                optionRepository.delete(option);

            }

        }

    }
}
