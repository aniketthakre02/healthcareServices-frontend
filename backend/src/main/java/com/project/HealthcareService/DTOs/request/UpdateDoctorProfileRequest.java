package com.project.HealthcareService.DTOs.request;

import lombok.Data;

@Data
public class UpdateDoctorProfileRequest{
    private String name;
    private Integer age;
    private String gender;
    private String specialization;
    private String contact;
    private String experience;
    private String introduction;
    private String availability;
}
