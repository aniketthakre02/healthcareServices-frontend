package com.project.HealthcareService.Service;

import com.project.HealthcareService.DTOs.request.CreateAppointmentRequest;
import com.project.HealthcareService.DTOs.response.AppointmentResponse;
import com.project.HealthcareService.Model.AppointmentStatus;

import java.util.List;

public interface AppointmentService {
    AppointmentResponse createAppointment(String patientId, CreateAppointmentRequest request);
    List<AppointmentResponse> getMyAppointments(String patientEmail);
    List<AppointmentResponse> getAllAppointments();
    AppointmentResponse updateStatus(Long id, AppointmentStatus status);



}
