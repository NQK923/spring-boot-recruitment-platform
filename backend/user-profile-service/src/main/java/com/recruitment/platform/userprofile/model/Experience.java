package com.recruitment.platform.userprofile.model;

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
@Table(name = "experiences")
public class Experience {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String companyName;
    @Column(columnDefinition = "TEXT")
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type")
    private EmploymentType employmentType;
    @Column(name = "is_current")
    private boolean current;
    @Column(columnDefinition = "TEXT")
    private String achievements;
    @Convert(converter = StringListConverter.class)
    @Column(name = "tech_stack", columnDefinition = "TEXT")
    private List<String> techStack = new ArrayList<>();
}
