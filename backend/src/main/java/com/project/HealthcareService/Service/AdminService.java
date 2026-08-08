package com.project.HealthcareService.Service;

import com.project.HealthcareService.DTOs.request.AdminUpdateUserRequest;
import com.project.HealthcareService.DTOs.response.UserResponse;
import com.project.HealthcareService.Model.ApplicationUser;
import com.project.HealthcareService.Model.Doctor;
import com.project.HealthcareService.Model.Patient;
import com.project.HealthcareService.Model.Role;
import com.project.HealthcareService.Repository.ApplicationUserRepository;
import com.project.HealthcareService.Repository.DoctorRepository;
import com.project.HealthcareService.Repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final ApplicationUserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(u -> new UserResponse(
                        u.getUserId(),
                        u.getUserName(),
                        u.getEmail(),
                        u.getRoles()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(String userId) {
        ApplicationUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.getRoles()
        );
    }

    @Transactional
    public UserResponse updateUser(String userId, AdminUpdateUserRequest request) {
        ApplicationUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUserName() != null && !request.getUserName().isBlank())
            user.setUserName(request.getUserName());

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            // Ensure email uniqueness
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(request.getRoles());
            // Ensure related Doctor/Patient entities exist when roles are added
            if (request.getRoles().contains(Role.ROLE_DOCTOR)) {
                doctorRepository.findByUser(user).orElseGet(() -> {
                    Doctor d = new Doctor();
                    d.setUser(user);
                    d.setUserName(user.getUserName());
                    return doctorRepository.save(d);
                });
            }
            if (request.getRoles().contains(Role.ROLE_PATIENT)) {
                patientRepository.findByUser(user).orElseGet(() -> {
                    Patient p = new Patient();
                    p.setUser(user);
                    p.setUserName(user.getUserName());
                    return patientRepository.save(p);
                });
            }
        }
        // Flush is automatic at transaction commit
        return new UserResponse(
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.getRoles()
        );
    }
}
