package com.recruitment.platform.userprofile.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.recruitment.platform.userprofile.model.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_user_id")
    @JsonIgnore
    private Profile profile;

    private String name;
    private String role;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    @Column(columnDefinition = "TEXT")
    private String achievements;

    @Convert(converter = StringListConverter.class)
    @Column(name = "tech_stack", columnDefinition = "TEXT")
    private List<String> techStack = new ArrayList<>();

    @Column(name = "project_url")
    private String projectUrl;

    @Column(name = "repo_url")
    private String repoUrl;

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(name = "is_current")
    private boolean current;
}
