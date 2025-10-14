package com.recruitment.platform.userprofile.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "profiles")
public class Profile {
    @Id
    private Long userId;
    private String fullName;
    private String phoneNumber;
    private String summary;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_user_id")
    private List<Experience> experiences;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Cv> cvs;

    // Getters & Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public List<Cv> getCvs() { return cvs; }
    public void setCvs(List<Cv> cvs) { this.cvs = cvs; }
}
