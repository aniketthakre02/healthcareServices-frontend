package com.project.HealthcareService.Repository;

import com.project.HealthcareService.Model.ApplicationUser;
import com.project.HealthcareService.Model.Appointment;
import com.project.HealthcareService.Model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient,String> {
    Optional<Patient> findByUserId(String userId);

    Optional<Patient> findByUser_Email(String email);
    Optional<Patient> findByUser(ApplicationUser user);
//  List<Appointment> findByPatient_User_Email(String email);
}
