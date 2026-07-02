package com.example.OneNightProject.product.mapper;

import com.example.OneNightProject.product.dto.response.CustomFieldResponse;
import com.example.OneNightProject.product.entity.CustomField;
import org.mapstruct.Mapper;

@Mapper(
        componentModel = "spring",
        uses = CustomFieldOptionMapper.class
)
public interface CustomFieldMapper {

    CustomFieldResponse toResponse(
            CustomField field
    );

}
