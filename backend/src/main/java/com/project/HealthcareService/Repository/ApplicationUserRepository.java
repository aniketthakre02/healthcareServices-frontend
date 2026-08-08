package com.project.HealthcareService.Repository;

import com.project.HealthcareService.Model.ApplicationUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicationUserRepository extends JpaRepository<ApplicationUser, String> {

    Optional<ApplicationUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
