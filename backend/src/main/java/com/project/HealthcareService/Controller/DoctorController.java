package com.project.HealthcareService.Controller;

import com.project.HealthcareService.DTOs.request.UpdateDoctorProfileRequest;
import com.project.HealthcareService.DTOs.response.AppointmentResponse;
import com.project.HealthcareService.DTOs.response.DoctorProfileResponse;
import com.project.HealthcareService.Model.Appointment;
import com.project.HealthcareService.Model.AppointmentStatus;
import com.project.HealthcareService.Service.AppointmentService;
import com.project.HealthcareService.Service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_DOCTOR')")
public class DoctorController {
    private final DoctorService doctorService;
    private final AppointmentService appointmentService;

    @GetMapping("/myProfile")
    public ResponseEntity<DoctorProfileResponse> getProfile(
            Authentication authentication){
        String email= authentication.getName();
        return ResponseEntity.ok(doctorService.getMyProfile(email));
    }
    @PutMapping("/updateMyProfile")
    public ResponseEntity<DoctorProfileResponse> updateProfile(@RequestBody UpdateDoctorProfileRequest request,
            Authentication authentication){
        String email=authentication.getName();
        return ResponseEntity.ok(
                doctorService.updateMyProfile(email,request)
        );
    }
    @GetMapping("/myAppointments")
    public ResponseEntity<List<AppointmentResponse>> appointmentList(Authentication authentication){
        String email=authentication.getName();
        return ResponseEntity.ok(doctorService.getMyAppointments(email));
    }

    @PutMapping("/appointment/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status,
            Authentication authentication
    ){
      if(status!=AppointmentStatus.APPROVED&& status!=AppointmentStatus.CANCELLED){
          return ResponseEntity.badRequest().build();
      }
      return ResponseEntity.ok(appointmentService.updateStatus(id,status));
    }



}
