package com.recruitment.platform.job.service;

import com.recruitment.platform.job.dto.JobPostingPublicDto;
import com.recruitment.platform.job.model.JobPosting;
import com.recruitment.platform.job.model.JobStatus;
import com.recruitment.platform.job.repository.JobPostingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobPostingService {

    private final JobPostingRepository repository;

    public JobPostingService(JobPostingRepository repository) {
        this.repository = repository;
    }

    public List<JobPostingPublicDto> findAllPublicJobs() {
        return repository.findByStatus(JobStatus.OPEN).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<JobPostingPublicDto> findPublicJobById(Long id) {
        return repository.findById(id)
                .filter(job -> job.getStatus() == JobStatus.OPEN)
                .map(this::convertToDto);
    }

    private JobPostingPublicDto convertToDto(JobPosting jobPosting) {
        return new JobPostingPublicDto(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getDescription()
        );
    }
}
