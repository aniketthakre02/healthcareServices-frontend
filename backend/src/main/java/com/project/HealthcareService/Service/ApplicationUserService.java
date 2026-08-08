package com.project.HealthcareService.Service;

import com.project.HealthcareService.DTOs.request.RegisterRequest;
import com.project.HealthcareService.Model.ApplicationUser;

import java.util.List;

public interface ApplicationUserService {
    void register(RegisterRequest request);
    String login(String email,String password);
     List<ApplicationUser> getAllUsers();
     boolean deleteUser(String userId);
}
