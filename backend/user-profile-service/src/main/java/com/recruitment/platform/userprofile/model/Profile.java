package com.recruitment.platform.userprofile.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "profiles")
public class Profile {
    @Id
    private Long userId;
    private String fullName;
    private String phoneNumber;
    private String summary;
    @Column(name = "avatar_path")
    private String avatarPath;
    @Column(name = "email_for_cv")
    private String emailForCv;
    private String location;
    private String website;
    private String linkedin;
    private String github;
    private String portfolio;
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;
    @Column(name = "desired_position")
    private String desiredPosition;
    @Column(name = "work_authorization")
    private String workAuthorization;
    @Column(name = "open_to_relocate")
    private boolean openToRelocate;
    @Column(name = "preferred_cv_language")
    private String preferredCvLanguage = "vi";

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_user_id")
    private List<Experience> experiences = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_user_id")
    private List<Education> education = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_user_id")
    private List<Skill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Cv> cvs = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Project> projects = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certification> certifications = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfileLanguage> languages = new ArrayList<>();

}
