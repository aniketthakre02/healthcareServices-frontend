package com.project.HealthcareService.Controller;

import com.project.HealthcareService.DTOs.request.CreateAppointmentRequest;
import com.project.HealthcareService.DTOs.response.AppointmentResponse;
import com.project.HealthcareService.Service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @PostMapping("/BookAppointment")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        AppointmentResponse response = appointmentService.createAppointment(email, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/myAppointments")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public List<AppointmentResponse> getMyAppointments(Authentication authentication){
        String patientEmail = authentication.getName();
        return appointmentService.getMyAppointments(patientEmail);
    }
}
