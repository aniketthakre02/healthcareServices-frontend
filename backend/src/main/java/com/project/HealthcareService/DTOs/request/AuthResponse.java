package com.project.HealthcareService.DTOs.request;

import lombok.AllArgsConstructor;
import lombok.Data;

// DTOs/response/AuthResponse.java
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
}