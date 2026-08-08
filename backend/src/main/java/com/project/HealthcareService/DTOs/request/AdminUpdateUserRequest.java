package com.project.HealthcareService.DTOs.request;

import com.project.HealthcareService.Model.Role;
import lombok.Data;

import java.util.Set;

@Data
public class AdminUpdateUserRequest {
    private String userName;
    private String email;
    private Set<Role> roles;
}
