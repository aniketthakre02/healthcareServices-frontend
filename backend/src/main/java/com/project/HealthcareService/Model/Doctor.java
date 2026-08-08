package com.project.HealthcareService.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Doctor {
    @Id
    private String userId;
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name="user_id")
    private ApplicationUser user;
    private String userName;
    private Integer age;
    private String gender;
    private String specialization;
    private String contact;
    private String experience;
    @Column(length = 1000)
    private String introduction;
    private String availability;
}
