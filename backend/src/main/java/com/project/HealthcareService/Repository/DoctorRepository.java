package com.project.HealthcareService.Repository;

import com.project.HealthcareService.Model.ApplicationUser;
import com.project.HealthcareService.Model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor,String> {
    Optional<Doctor> findByUser_Email(String email);
    Optional<Doctor> findByUser(ApplicationUser user);
//    String findByUserName(String doctorName);
}
