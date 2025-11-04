package com.recruitment.platform.application.service;

import com.recruitment.platform.application.dto.CreateApplicationTaskRequest;
import com.recruitment.platform.application.dto.UpdateApplicationTaskRequest;
import com.recruitment.platform.application.model.ApplicationTask;
import com.recruitment.platform.application.model.ApplicationTaskStatus;
import com.recruitment.platform.application.repository.ApplicationTaskRepository;
import com.recruitment.platform.common.exception.BadRequestException;
import com.recruitment.platform.common.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ApplicationCollaborationService {

    private final ApplicationService applicationService;
    private final ApplicationTaskRepository taskRepository;

    public ApplicationCollaborationService(ApplicationService applicationService,
                                           ApplicationTaskRepository taskRepository) {
        this.applicationService = applicationService;
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<ApplicationTask> getTasks(Long applicationId, Long companyId) {
        applicationService.assertRecruiterAccessToApplication(applicationId, companyId);
        return taskRepository.findByApplicationIdOrderByDueDateAscCreatedAtAsc(applicationId);
    }

    @Transactional
    public ApplicationTask createTask(Long applicationId,
                                      Long companyId,
                                      Long createdByUserId,
                                      CreateApplicationTaskRequest request) {
        applicationService.assertRecruiterAccessToApplication(applicationId, companyId);
        if (request.title() == null || request.title().isBlank()) {
            throw new BadRequestException("Task title is required");
        }
        ApplicationTask task = new ApplicationTask();
        task.setApplicationId(applicationId);
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate());
        task.setAssignedToUserId(request.assignedToUserId());
        task.setCreatedByUserId(createdByUserId);
        task.setStatus(ApplicationTaskStatus.PENDING);
        return taskRepository.save(task);
    }

    @Transactional
    public ApplicationTask updateTask(Long applicationId,
                                      Long taskId,
                                      Long companyId,
                                      UpdateApplicationTaskRequest request) {
        applicationService.assertRecruiterAccessToApplication(applicationId, companyId);
        ApplicationTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found"));
        if (!task.getApplicationId().equals(applicationId)) {
            throw new BadRequestException("Task does not belong to this application");
        }

        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new BadRequestException("Task title cannot be blank");
            }
            task.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }
        if (request.assignedToUserId() != null) {
            task.setAssignedToUserId(request.assignedToUserId());
        }
        if (request.status() != null) {
            ApplicationTaskStatus status = ApplicationTaskStatus.valueOf(request.status().toUpperCase());
            task.setStatus(status);
            if (status == ApplicationTaskStatus.COMPLETED) {
                task.setCompletedAt(Instant.now());
            } else {
                task.setCompletedAt(null);
            }
        }
        return taskRepository.save(task);
    }
}
