package com.project.HealthcareService.DTOs.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorProfileResponse {
    private String userId;
    private String name;
    private String email;
    private Integer age;
    private String gender;
    private String specialization;
    private String contact;
    private String experience;
    private String introduction;
    private String availability;
}
