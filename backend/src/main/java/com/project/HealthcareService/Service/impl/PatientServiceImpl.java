package com.project.HealthcareService.Service.impl;

import com.project.HealthcareService.DTOs.request.ChangePasswordRequest;
import com.project.HealthcareService.DTOs.request.UpdatePatientProfileRequest;
import com.project.HealthcareService.DTOs.response.AppointmentResponse;
import com.project.HealthcareService.DTOs.response.PatientProfileResponse;
import com.project.HealthcareService.Model.ApplicationUser;
import com.project.HealthcareService.Model.Appointment;
import com.project.HealthcareService.Model.Doctor;
import com.project.HealthcareService.Model.Patient;
import com.project.HealthcareService.Repository.ApplicationUserRepository;
import com.project.HealthcareService.Repository.AppointmentRepository;
import com.project.HealthcareService.Repository.DoctorRepository;
import com.project.HealthcareService.Repository.PatientRepository;
import com.project.HealthcareService.Service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepo;
    private final ApplicationUserRepository repo;
    private final AppointmentRepository appointmentRepo;
    private final PasswordEncoder encoder;
    private final DoctorRepository doctorRepo;

    @Override
    @Transactional
    public Optional<PatientProfileResponse> getProfileByEmail(String email) {
        ApplicationUser user = repo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = patientRepo.findByUser(user)
                .orElseGet(() -> {
                    Patient p = new Patient();
                    p.setUser(user);
                    return patientRepo.save(p);
                });

        return mapToResponse(patient);
    }

    @Override
    @Transactional
    public Optional<PatientProfileResponse> updateProfile(String email, UpdatePatientProfileRequest request) {
        Patient patient = patientRepo.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        ApplicationUser user = patient.getUser();
        if (user == null) {
            user = repo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            patient.setUser(user);
        }

        // Update patient fields safely
        if (request.getName() != null && !request.getName().isBlank()) {
            patient.setUserName(request.getName());
            // Also sync ApplicationUser's userName for consistency
            user.setUserName(request.getName());
            repo.save(user);
        }
        if (request.getAge() != null) patient.setAge(request.getAge());
        if (request.getGender() != null) patient.setGender(request.getGender());
        if (request.getContact() != null) patient.setContact(request.getContact());

        patientRepo.save(patient);
        return mapToResponse(patient);
    }

    private Optional<PatientProfileResponse> mapToResponse(Patient patient) {
        ApplicationUser u = patient.getUser();
        return Optional.of(PatientProfileResponse.builder()
                .userId(patient.getUserId() != null ? patient.getUserId() : (u != null ? u.getUserId() : null))
                .name(patient.getUserName() != null ? patient.getUserName() : (u != null ? u.getUserName() : ""))
                .age(patient.getAge())
                .gender(patient.getGender())
                .contact(patient.getContact())
                .email(u != null ? u.getEmail() : "")
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments(String email) {
        return appointmentRepo.findByPatientEmail(email)
                .stream()
                .map(this::mapAppointmentToResponse)
                .toList();
    }

    private AppointmentResponse mapAppointmentToResponse(Appointment appointment) {
        String doctorName = doctorRepo.findById(appointment.getDoctorId())
                .map(d -> d.getUserName() != null ? d.getUserName() : (d.getUser() != null ? d.getUser().getUserName() : "Unknown Doctor"))
                .orElse("Unknown Doctor");

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientEmail(appointment.getPatientEmail())
                .doctorName(doctorName)
                .doctorId(appointment.getDoctorId())
                .dateTime(appointment.getDateTime())
                .reason(appointment.getReason())
                .status(appointment.getStatus())
                .build();
    }

    @Override
    public AppointmentResponse cancelAppointment(Long appointmentId, String email) {
        // TODO: implement cancellation logic with ownership check
        throw new UnsupportedOperationException("Cancel not yet implemented");
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        ApplicationUser user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }
        user.setPassword(encoder.encode(request.getNewPassword()));
        repo.save(user);
    }
}
