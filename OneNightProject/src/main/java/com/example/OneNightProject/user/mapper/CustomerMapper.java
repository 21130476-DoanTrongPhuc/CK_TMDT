package com.example.OneNightProject.user.mapper;

import com.example.OneNightProject.user.dto.request.CustomerRequest;
import com.example.OneNightProject.user.dto.request.ResetPasswordRequest;
import com.example.OneNightProject.user.dto.response.CustomerResponse;
import com.example.OneNightProject.user.dto.response.ResponsePasswordReset;
import com.example.OneNightProject.user.entity.Users;
import lombok.RequiredArgsConstructor;

import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
//  @Mapping(source = "username", target = "name")
    CustomerResponse toCustomerResposne(Users entity);
    Users toEntityCustomerRequest(CustomerRequest request);
    ResponsePasswordReset toResponsePasswordReset(Users entity);
    Users toEntityCustomerRequest(ResetPasswordRequest request);
}
