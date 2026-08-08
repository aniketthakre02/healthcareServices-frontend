package com.project.HealthcareService.DTOs.request;

import lombok.Data;

@Data
public class UpdatePatientProfileRequest {
    private String name;
    private Integer age;
    private String gender;
    private String contact;
}
