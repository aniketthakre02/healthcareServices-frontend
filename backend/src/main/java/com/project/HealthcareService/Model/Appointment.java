package com.project.HealthcareService.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String patientEmail;
    @Column(nullable = false)
    private String doctorId;
    @Column(nullable = false)
    private LocalDateTime dateTime;
    @Column(length = 500)
    private String reason;
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;
    private LocalDateTime createdAt;
}
