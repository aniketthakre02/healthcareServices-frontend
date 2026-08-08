package com.project.HealthcareService.Controller;

import com.project.HealthcareService.DTOs.request.ChangePasswordRequest;
import com.project.HealthcareService.DTOs.request.UpdatePatientProfileRequest;
import com.project.HealthcareService.DTOs.response.AppointmentResponse;
import com.project.HealthcareService.DTOs.response.DoctorProfileResponse;
import com.project.HealthcareService.DTOs.response.PatientProfileResponse;
import com.project.HealthcareService.Service.DoctorService;
import com.project.HealthcareService.Service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/patient")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientservice;
    private final DoctorService doctorService;

    @GetMapping("/myProfile")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<Optional<PatientProfileResponse>> getProfile(Authentication authentication){
        String email = authentication.getName();
        return ResponseEntity.ok(patientservice.getProfileByEmail(email));
    }

    @PutMapping("/updateMyProfile")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<Optional<PatientProfileResponse>> updateProfile(
            @RequestBody UpdatePatientProfileRequest request,
            Authentication authentication){
        String email = authentication.getName();
        return ResponseEntity.ok(patientservice.updateProfile(email, request));
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(Authentication authentication){
        String email = authentication.getName();
        return ResponseEntity.ok(patientservice.getMyAppointments(email));
    }

    @PostMapping("/change-password")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT','ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<?> changePassword(@RequestBody @Valid ChangePasswordRequest request, Authentication authentication){
        try{
            patientservice.changePassword(authentication.getName(), request);
            return ResponseEntity.ok("Password changed successfully");
        } catch(RuntimeException ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    // Fix: Allow all authenticated roles to browse doctors (needed by Doctors page)
    @GetMapping("/allDoctors")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DoctorProfileResponse>> getDoctorsList(){
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }
}
