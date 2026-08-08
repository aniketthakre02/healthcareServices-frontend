package com.project.HealthcareService.Service.impl;

import com.project.HealthcareService.DTOs.request.CreateAppointmentRequest;
import com.project.HealthcareService.DTOs.response.AppointmentResponse;
import com.project.HealthcareService.Model.Appointment;
import com.project.HealthcareService.Model.AppointmentStatus;
import com.project.HealthcareService.Repository.AppointmentRepository;
import com.project.HealthcareService.Repository.DoctorRepository;
import com.project.HealthcareService.Service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public AppointmentResponse createAppointment(String email, CreateAppointmentRequest request) {
        // Validate doctor exists
        if (!doctorRepository.existsById(request.getDoctorId())) {
            throw new RuntimeException("Doctor not found with id: " + request.getDoctorId());
        }
        // Validate future date (also validated via @Future but double-check)
        if (request.getDateTime() == null || request.getDateTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Appointment must be scheduled in the future");
        }
        Appointment appointment = Appointment.builder()
                .patientEmail(email)
                .doctorId(request.getDoctorId())
                .dateTime(request.getDateTime())
                .reason(request.getReason())
                .status(AppointmentStatus.REQUESTED)
                .createdAt(LocalDateTime.now())
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // Enrich with doctorName
        String doctorName = doctorRepository.findById(saved.getDoctorId())
                .map(d -> d.getUserName() != null ? d.getUserName() : (d.getUser() != null ? d.getUser().getUserName() : "Unknown"))
                .orElse("Unknown Doctor");

        return AppointmentResponse.builder()
                .id(saved.getId())
                .patientEmail(saved.getPatientEmail())
                .doctorId(saved.getDoctorId())
                .doctorName(doctorName)
                .dateTime(saved.getDateTime())
                .reason(saved.getReason())
                .status(saved.getStatus())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments(String patientEmail) {
        return appointmentRepository.findByPatientEmail(patientEmail)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        String doctorName = null;
        try {
            doctorName = doctorRepository.findById(appointment.getDoctorId())
                    .map(d -> d.getUserName() != null ? d.getUserName() : (d.getUser() != null ? d.getUser().getUserName() : null))
                    .orElse(null);
        } catch (Exception ignored) {}
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientEmail(appointment.getPatientEmail())
                .doctorId(appointment.getDoctorId())
                .doctorName(doctorName != null ? doctorName : "Unknown Doctor")
                .dateTime(appointment.getDateTime())
                .reason(appointment.getReason())
                .status(appointment.getStatus())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AppointmentResponse updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(status);
        Appointment updated = appointmentRepository.save(appointment);
        return mapToResponse(updated);
    }
}
