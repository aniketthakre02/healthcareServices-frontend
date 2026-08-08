package com.project.HealthcareService.Repository;

import com.project.HealthcareService.Model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment,Long> {

    List<Appointment> findByPatientEmail(String patientEmail);

    List<Appointment> findByDoctorId(String doctorId);

}
