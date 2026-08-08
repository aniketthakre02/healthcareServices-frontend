package com.project.HealthcareService.Service;

import com.project.HealthcareService.DTOs.request.ChangePasswordRequest;
import com.project.HealthcareService.DTOs.request.UpdatePatientProfileRequest;
import com.project.HealthcareService.DTOs.response.AppointmentResponse;
import com.project.HealthcareService.DTOs.response.PatientProfileResponse;
import com.project.HealthcareService.Model.AppointmentStatus;

import java.util.List;
import java.util.Optional;

public interface PatientService {
    Optional<PatientProfileResponse> getProfileByEmail(String email);
    Optional<PatientProfileResponse> updateProfile(String email, UpdatePatientProfileRequest request);

    List<AppointmentResponse> getMyAppointments(String email);
    AppointmentResponse cancelAppointment(Long appointmentId,String email);

    void changePassword(String name,ChangePasswordRequest req);


}
