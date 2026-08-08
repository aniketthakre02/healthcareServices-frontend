package com.project.HealthcareService.Service.impl;

import com.project.HealthcareService.DTOs.request.UpdateDoctorProfileRequest;
import com.project.HealthcareService.DTOs.response.AppointmentResponse;
import com.project.HealthcareService.DTOs.response.DoctorProfileResponse;
import com.project.HealthcareService.Model.*;
import com.project.HealthcareService.Repository.ApplicationUserRepository;
import com.project.HealthcareService.Repository.AppointmentRepository;
import com.project.HealthcareService.Repository.DoctorRepository;
import com.project.HealthcareService.Service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepo;
    private final ApplicationUserRepository repo;
    private final AppointmentRepository appointmentRepo;

    @Override
    @Transactional(readOnly = true)
    public DoctorProfileResponse getMyProfile(String email) {
        ApplicationUser user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not Found"));

        Doctor doctor = doctorRepo.findByUser(user)
                .orElseGet(() -> {
                    Doctor d = new Doctor();
                    d.setUser(user);
                    d.setUserName(user.getUserName());
                    return doctorRepo.save(d);
                });
        return mapToResponse(doctor);
    }

    private DoctorProfileResponse mapToResponse(Doctor doctor) {
       return DoctorProfileResponse.builder()
               .userId(doctor.getUserId())
               .name(doctor.getUser() != null ? doctor.getUser().getUserName() : doctor.getUserName())
               .email(doctor.getUser() != null ? doctor.getUser().getEmail() : "")
               .age(doctor.getAge())
               .gender(doctor.getGender())
               .specialization(doctor.getSpecialization())
               .contact(doctor.getContact())
               .availability(doctor.getAvailability())
               .introduction(doctor.getIntroduction())
               .experience(doctor.getExperience())
               .build();
    }

    @Override
    @Transactional
    public DoctorProfileResponse updateMyProfile(String email, UpdateDoctorProfileRequest request){
        ApplicationUser user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doctor = doctorRepo.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        // Safely update fields, handling nulls to avoid NPE on primitive int
        if (request.getName() != null && !request.getName().isBlank()) {
            doctor.setUserName(request.getName());
            // Keep ApplicationUser in sync
            user.setUserName(request.getName());
            repo.save(user);
        } else if (doctor.getUserName() == null) {
            doctor.setUserName(user.getUserName());
        }
        if (request.getGender() != null) doctor.setGender(request.getGender());
        if (request.getAge() != null) doctor.setAge(request.getAge());
        if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getContact() != null) doctor.setContact(request.getContact());
        if (request.getAvailability() != null) doctor.setAvailability(request.getAvailability());
        if (request.getExperience() != null) doctor.setExperience(request.getExperience());
        if (request.getIntroduction() != null) doctor.setIntroduction(request.getIntroduction());

        doctorRepo.save(doctor);
        return mapToResponse(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments(String email) {
        ApplicationUser user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not Found"));

        if (!user.getRoles().contains(Role.ROLE_DOCTOR)) {
            throw new RuntimeException("Access denied: not a doctor");
        }

        return appointmentRepo.findByDoctorId(user.getUserId())
                .stream()
                .map(appt -> AppointmentResponse.builder()
                        .id(appt.getId())
                        .patientEmail(appt.getPatientEmail())
                        .doctorId(appt.getDoctorId())
                        .dateTime(appt.getDateTime())
                        .reason(appt.getReason())
                        .status(appt.getStatus())
                        .build()
                )
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse updateAppointmentStatus(Long appointmentId, AppointmentStatus status) {
        // Delegated to AppointmentServiceImpl for consistency
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorProfileResponse> getAllDoctors(){
        return doctorRepo.findAll()
                .stream()
                .map(doctor -> DoctorProfileResponse.builder()
                        .userId(doctor.getUserId())
                        .name(doctor.getUserName() != null ? doctor.getUserName() : (doctor.getUser() != null ? doctor.getUser().getUserName() : "Unknown"))
                        .specialization(doctor.getSpecialization())
                        .experience(doctor.getExperience())
                        .availability(doctor.getAvailability())
                        .introduction(doctor.getIntroduction())
                        .age(doctor.getAge())
                        .email(doctor.getUser() != null ? doctor.getUser().getEmail() : "")
                        .gender(doctor.getGender())
                        .contact(doctor.getContact())
                        .build()
                )
                .collect(Collectors.toList());
    }
}
