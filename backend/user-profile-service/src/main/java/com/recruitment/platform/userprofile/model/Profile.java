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

}
