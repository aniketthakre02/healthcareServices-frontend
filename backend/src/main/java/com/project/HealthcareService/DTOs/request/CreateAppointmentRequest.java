package com.project.HealthcareService.DTOs.request;

import lombok.Data;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
@Data
public class CreateAppointmentRequest {
    @NotBlank(message = "Doctor ID is required")
    private String doctorId;
    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment must be in the future")
    private LocalDateTime dateTime;
    @NotBlank(message = "Reason is required")
    private String reason;
    private String doctorName;
}
