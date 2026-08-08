package com.project.HealthcareService.DTOs.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientProfileResponse {
    private String userId;
    private String email;
    private String name;
    private Integer age;
    private String gender;
    private String contact;
}
