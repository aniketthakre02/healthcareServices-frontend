package com.project.HealthcareService.Controller;

import com.project.HealthcareService.DTOs.request.AuthResponse;
import com.project.HealthcareService.DTOs.request.LoginRequest;
import com.project.HealthcareService.DTOs.request.RegisterRequest;
import com.project.HealthcareService.Service.ApplicationUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class ApplicationUserController {
    private final ApplicationUserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid RegisterRequest request) {
        userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest req){
        String token = userService.login(req.getEmail(), req.getPassword());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
