package com.project.HealthcareService.Service;

import com.project.HealthcareService.DTOs.request.UpdateDoctorProfileRequest;
import com.project.HealthcareService.DTOs.response.AppointmentResponse;
import com.project.HealthcareService.DTOs.response.DoctorProfileResponse;
import com.project.HealthcareService.Model.AppointmentStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface DoctorService {
    DoctorProfileResponse getMyProfile(String email);
    DoctorProfileResponse updateMyProfile(String email, UpdateDoctorProfileRequest request);
    List<AppointmentResponse> getMyAppointments(String email);
    List<DoctorProfileResponse> getAllDoctors();
    AppointmentResponse updateAppointmentStatus(Long appointmentId, AppointmentStatus status);
}
