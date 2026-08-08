package com.project.HealthcareService.Controller;

import com.project.HealthcareService.DTOs.request.AdminUpdateUserRequest;
import com.project.HealthcareService.DTOs.response.AppointmentResponse;
import com.project.HealthcareService.DTOs.response.UserResponse;
import com.project.HealthcareService.Model.AppointmentStatus;
import com.project.HealthcareService.Service.AdminService;
import com.project.HealthcareService.Service.ApplicationUserService;
import com.project.HealthcareService.Service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {
    private final AdminService adminService;
    private  final ApplicationUserService userService;
    private final AppointmentService appointmentService;
    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }
    @GetMapping("/users/{id}")

    public UserResponse getUser(@PathVariable String id) {
        return adminService.getUserById(id);
    }
    @PutMapping("/users/{id}")
    public UserResponse updateUser(
            @PathVariable String id,
            @RequestBody AdminUpdateUserRequest request) {
        return adminService.updateUser(id, request);
    }
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        boolean deleted = userService.deleteUser(userId);
        if (deleted) {
            return ResponseEntity.ok("User deleted successfully");
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }
    @GetMapping("/appointments")
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }
    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        AppointmentResponse response =
                appointmentService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }
}