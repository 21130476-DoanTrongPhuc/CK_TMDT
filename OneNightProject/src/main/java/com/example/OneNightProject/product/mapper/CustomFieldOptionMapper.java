package com.example.OneNightProject.product.mapper;

import com.example.OneNightProject.product.dto.response.CustomFieldOptionResponse;
import com.example.OneNightProject.product.entity.CustomFieldOption;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomFieldOptionMapper {

    CustomFieldOptionResponse toResponse(
            CustomFieldOption option
    );

}
