package com.example.OneNightProject.product.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.product.dto.request.CreateCustomFieldOptionRequest;
import com.example.OneNightProject.product.dto.request.UpdateCustomFieldOptionRequest;
import com.example.OneNightProject.product.dto.response.CustomFieldOptionResponse;
import com.example.OneNightProject.product.entity.CustomField;
import com.example.OneNightProject.product.entity.CustomFieldOption;
import com.example.OneNightProject.product.mapper.CustomFieldOptionMapper;
import com.example.OneNightProject.product.repository.CustomFieldOptionRepository;
import com.example.OneNightProject.product.repository.CustomFieldRepository;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.product.service.CustomFieldOptionService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomFieldOptionServiceImpl
        implements CustomFieldOptionService {

    @Autowired
    private CustomerRepository userRepository;

    private final JwtService jwtService;

    private final ProductRepository productRepository;

    private final CustomFieldRepository customFieldRepository;

    private final CustomFieldOptionRepository optionRepository;

    private final CustomFieldOptionMapper optionMapper;

    private Long getSellerId(String authHeader) {

        String token = authHeader.replace("Bearer ", "");

        Users users = userRepository.findByEmail(jwtService.extractUsername(token));

        if(users.getRole().equals(CustomerEnum.SELLER)){
            return users.getId();
        }

        return null;
    }

    private CustomField getField(
            Long fieldId,
            Long sellerId
    ){

        return customFieldRepository

                .findByIdAndProductSellerId(
                        fieldId,
                        sellerId
                )

                .orElseThrow(()->
                        new EntityNotFoundException(
                                "Không tìm thấy Custom Field"
                        )
                );

    }

    private CustomFieldOption getOption(
            Long optionId,
            Long sellerId
    ){

        return optionRepository

                .findByIdAndFieldProductSellerId(
                        optionId,
                        sellerId
                )

                .orElseThrow(()->
                        new EntityNotFoundException(
                                "Không tìm thấy Option"
                        )
                );

    }

    private void validateOptionField(CustomField field){

        switch (field.getFieldType()){

            case TEXT:
            case TEXTAREA:

                throw new IllegalArgumentException(
                        "TEXT không được thêm option"
                );

            default:
                break;
        }

    }

    private Integer nextSortOrder(Long fieldId){

        Integer value =
                optionRepository.findMaxSortOrder(fieldId);

        if(value==null){

            return 1;

        }

        return value+1;

    }

    @Override
    public CustomFieldOptionResponse createOption(

            String authHeader,

            Long fieldId,

            CreateCustomFieldOptionRequest request
    ) {

        Long sellerId =
                getSellerId(authHeader);

        CustomField field =
                getField(fieldId,sellerId);

        validateOptionField(field);

        CustomFieldOption option =
                CustomFieldOption.builder()

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

                                request.getSortOrder()==null

                                        ?

                                        nextSortOrder(fieldId)

                                        :

                                        request.getSortOrder()

                        )

                        .active(true)

                        .createdAt(LocalDateTime.now())

                        .updatedAt(LocalDateTime.now())

                        .build();

        optionRepository.save(option);

        return optionMapper.toResponse(option);

    }

    @Override
    public CustomFieldOptionResponse updateOption(

            String authHeader,

            Long optionId,

            UpdateCustomFieldOptionRequest request
    ) {

        Long sellerId =
                getSellerId(authHeader);

        CustomFieldOption option =
                getOption(optionId,sellerId);

        option.setLabel(
                request.getLabel()
        );

        option.setValue(
                request.getValue()
        );

        option.setExtraPrice(
                request.getExtraPrice()
        );

        option.setImageUrl(
                request.getImageUrl()
        );

        option.setSortOrder(
                request.getSortOrder()
        );

        option.setActive(
                request.getActive()
        );

        option.setUpdatedAt(
                LocalDateTime.now()
        );

        optionRepository.save(option);

        return optionMapper.toResponse(option);

    }

    @Override
    public void deleteOption(

            String authHeader,

            Long optionId
    ) {

        Long sellerId =
                getSellerId(authHeader);

        CustomFieldOption option =
                getOption(optionId,sellerId);

        optionRepository.delete(option);

    }

    @Override
    @Transactional
    public List<CustomFieldOptionResponse> getOptions(

            String authHeader,

            Long fieldId
    ) {

        Long sellerId =
                getSellerId(authHeader);

        getField(fieldId,sellerId);

        return optionRepository

                .findByFieldIdOrderBySortOrder(fieldId)

                .stream()

                .map(optionMapper::toResponse)

                .toList();

    }


}