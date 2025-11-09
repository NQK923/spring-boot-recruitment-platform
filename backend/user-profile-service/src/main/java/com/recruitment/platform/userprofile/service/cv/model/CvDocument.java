package com.recruitment.platform.userprofile.service.cv.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CvDocument {
    private String fullName;
    private String title;
    private String summary;
    private Links links = new Links();
    private List<Experience> experiences = new ArrayList<>();
    private List<Education> education = new ArrayList<>();
    private List<Project> projects = new ArrayList<>();
    private List<Certification> certifications = new ArrayList<>();
    private List<Language> languages = new ArrayList<>();
    private List<String> skills = new ArrayList<>();

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Links {
        private String linkedin;
        private String github;
        private String website;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Experience {
        private String company;
        private String title;
        private String period;
        private List<String> bullets = new ArrayList<>();
        private List<String> tech = new ArrayList<>();
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Education {
        private String school;
        private String degree;
        private String period;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Project {
        private String name;
        private String role;
        private List<String> bullets = new ArrayList<>();
        private List<String> tech = new ArrayList<>();
        private String link;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Certification {
        private String name;
        private String issuer;
        private String issueDate;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Language {
        private String language;
        private String level;
    }
}
