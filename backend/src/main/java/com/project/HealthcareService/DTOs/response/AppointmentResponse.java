package com.project.HealthcareService.DTOs.response;

import com.project.HealthcareService.Model.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentResponse {
    private Long id;
    private String patientEmail;
//    private String patientName;
    private String doctorId;
    private String doctorName;
    private LocalDateTime dateTime;
    private String reason;
    private AppointmentStatus status;
}
