package com.project.HealthcareService.Service.impl;

import com.project.HealthcareService.DTOs.request.RegisterRequest;
import com.project.HealthcareService.Exception.UserAlreadyExistsException;
import com.project.HealthcareService.Model.ApplicationUser;
import com.project.HealthcareService.Model.Patient;
import com.project.HealthcareService.Repository.ApplicationUserRepository;
import com.project.HealthcareService.Repository.AppointmentRepository;
import com.project.HealthcareService.Repository.DoctorRepository;
import com.project.HealthcareService.Repository.PatientRepository;
import com.project.HealthcareService.Service.ApplicationUserService;
import com.project.HealthcareService.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static com.project.HealthcareService.Model.Role.*;

@Service
@RequiredArgsConstructor
public class ApplicationUserServiceImpl implements ApplicationUserService {
    private final ApplicationUserRepository repo;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (repo.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(
                    "User already exists with email: " + request.getEmail()
            );
        }
        ApplicationUser user = new ApplicationUser();
        user.setUserName(request.getUserName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRoles(new HashSet<>(Set.of(ROLE_PATIENT)));
        ApplicationUser saved = repo.save(user);
        // Create patient profile eagerly to avoid lazy creation race
        Patient patient = new Patient();
        patient.setUser(saved);
        patient.setUserName(saved.getUserName());
        patientRepository.save(patient);
    }

    @Override
    public String login(String email, String password) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (Exception e) {
            System.out.println("AUTH FAILED: " + e.getClass().getName() + " - " + e.getMessage());
            throw e;
        }
        ApplicationUser user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String role;
        if (user.getRoles().contains(ROLE_ADMIN)) {
            role = "ROLE_ADMIN";
        } else if (user.getRoles().contains(ROLE_DOCTOR)) {
            role = "ROLE_DOCTOR";
        } else {
            role = "ROLE_PATIENT";
        }
        return jwtUtil.generateToken(email, user.getUserName(), role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationUser> getAllUsers() {
        return repo.findAll();
    }

    @Override
    @Transactional
    public boolean deleteUser(String userId) {
        if (!repo.existsById(userId)) {
            return false;
        }
        try {
            repo.findById(userId).ifPresent(user -> {
                // Clean up related profiles
                patientRepository.findByUser(user).ifPresent(p -> {
                    // Remove patient's appointments
                    try { appointmentRepository.deleteByPatientEmail(user.getEmail()); } catch (Exception ignored) {}
                    patientRepository.delete(p);
                });
                doctorRepository.findByUser(user).ifPresent(d -> {
                    try { appointmentRepository.deleteByDoctorId(userId); } catch (Exception ignored) {}
                    doctorRepository.delete(d);
                });
                // If user had both roles but one was already deleted above, ensure remaining appointments cleaned
                // For users with no profile rows, still try to clean by id/email
                try { appointmentRepository.deleteByDoctorId(userId); } catch (Exception ignored) {}
                try { appointmentRepository.deleteByPatientEmail(user.getEmail()); } catch (Exception ignored) {}
            });
        } catch (Exception e) {
            System.out.println("Warning during related entity cleanup: " + e.getMessage());
        }
        repo.deleteById(userId);
        return true;
    }
}
