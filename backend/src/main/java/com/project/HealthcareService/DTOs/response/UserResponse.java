package com.project.HealthcareService.DTOs.response;

import com.project.HealthcareService.Model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class UserResponse {
    private String userId;
    private String userName;
    private String email;
    private Set<Role> roles;
}
