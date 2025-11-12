"use client";

import { useActionState, useState } from "react";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
  type ProfileFormState,
} from "@/app/candidate/profile/actions";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/profile/tag-input";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";

type ProjectsFormProps = {
  projects: Project[];
};

const initialState: ProfileFormState = {};

export function ProjectsForm({ projects }: ProjectsFormProps) {
  return (
    <div className="space-y-6">
        {projects.map((project) => (
          <EditableProjectCard
            key={`${project.id}-${project.current ? 1 : 0}-${(project.techStack ?? []).join(",")}`}
            project={project}
          />
        ))}
      <CreateProjectCard />
    </div>
  );
}

function EditableProjectCard({ project }: { project: Project }) {
  const [techStack, setTechStack] = useState<string[]>(project.techStack ?? []);
  const [state, formAction, pending] = useActionState(updateProjectAction, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteProjectAction,
    initialState
  );
  const [isCurrent, setIsCurrent] = useState(Boolean(project.current));

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-primary-200/60 bg-white/80 px-4 py-5 shadow-sm">
      <input type="hidden" name="projectId" value={String(project.id)} />
      <input type="hidden" name="techStack" value={JSON.stringify(techStack)} />
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <label className="flex-1 text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Tên dự án</span>
          <Input
            name="name"
            defaultValue={project.name ?? ""}
            disabled={pending}
            placeholder="Hệ thống CRM nội bộ"
          />
        </label>
        <label className="flex-1 text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Vai trò</span>
          <Input
            name="role"
            defaultValue={project.role ?? ""}
            disabled={pending}
            placeholder="Tech Lead"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Ngày bắt đầu</span>
          <Input type="date" name="startDate" defaultValue={project.startDate ?? ""} disabled={pending} />
        </label>
        <label className="text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Ngày kết thúc</span>
          <Input
            type="date"
            name="endDate"
            defaultValue={project.endDate ?? ""}
            disabled={pending || isCurrent}
          />
          <span className="mt-2 flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              name="isCurrent"
              defaultChecked={isCurrent}
              onChange={(event) => setIsCurrent(event.target.checked)}
              disabled={pending}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Dự án đang hoạt động
          </span>
        </label>
      </div>

      <label className="text-sm text-muted">
        <span className="mb-1 block font-semibold text-text">Tóm tắt mục tiêu / phạm vi</span>
        <AutoResizeTextarea
          name="summary"
          defaultValue={project.summary ?? ""}
          disabled={pending}
          minRows={3}
          maxRows={10}
        />
      </label>

      <label className="text-sm text-muted">
        <span className="mb-1 block font-semibold text-text">Trách nhiệm chính</span>
        <AutoResizeTextarea
          name="responsibilities"
          defaultValue={project.responsibilities ?? ""}
          disabled={pending}
          placeholder="- Dẫn dắt squad 8 người...\n- Làm việc với khối vận hành..."
          minRows={3}
          maxRows={10}
        />
      </label>

      <label className="text-sm text-muted">
        <span className="mb-1 block font-semibold text-text">Thành tựu nổi bật</span>
        <AutoResizeTextarea
          name="achievements"
          defaultValue={project.achievements ?? ""}
          disabled={pending}
          placeholder="- Giảm 35% chi phí lưu trữ...\n- Tăng 22% NPS khách hàng..."
          minRows={3}
          maxRows={10}
        />
      </label>

      <TagInput
        label="Tech stack / Công cụ"
        placeholder="Nhập từng công nghệ rồi nhấn Enter"
        values={techStack}
        onChangeAction={setTechStack}
        disabled={pending}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Đường dẫn giới thiệu</span>
          <Input
            name="projectUrl"
            defaultValue={project.projectUrl ?? ""}
            placeholder="https://project.talentflow.vn"
            disabled={pending}
          />
        </label>
        <label className="text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Kho mã / Repo</span>
          <Input
            name="repoUrl"
            defaultValue={project.repoUrl ?? ""}
            placeholder="https://github.com/team/project"
            disabled={pending}
          />
        </label>
      </div>

      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu dự án"}
        </Button>
        <button
          type="submit"
          formAction={deleteAction}
          disabled={deletePending}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-2 border-red-300 bg-red-50 text-red-700 transition-all hover:border-red-400 hover:bg-red-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          title="Xóa dự án"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      {deleteState?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {deleteState.error}
        </p>
      ) : null}
    </form>
  );
}

function CreateProjectCard() {
  const [techStack, setTechStack] = useState<string[]>([]);
  const [state, formAction, pending] = useActionState(createProjectAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-dashed border-primary-300 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 px-4 py-5"
    >
      <p className="text-sm font-semibold text-gray-900">Thêm dự án mới</p>
      <input type="hidden" name="techStack" value={JSON.stringify(techStack)} />
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Input name="name" placeholder="Tên dự án" disabled={pending} />
        <Input name="role" placeholder="Vai trò" disabled={pending} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="date" name="startDate" disabled={pending} />
        <Input type="date" name="endDate" disabled={pending} placeholder="Ngày kết thúc" />
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          name="isCurrent"
          disabled={pending}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Dự án đang chạy
      </label>
      <AutoResizeTextarea
        name="summary"
        placeholder="Mục tiêu dự án, bối cảnh kinh doanh..."
        disabled={pending}
        minRows={3}
        maxRows={8}
      />
      <TagInput
        label="Tech stack"
        placeholder="React, GraphQL, Terraform..."
        values={techStack}
        onChangeAction={setTechStack}
        disabled={pending}
      />
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.success}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Đang thêm..." : "Thêm dự án"}
        </Button>
        {state?.success ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setTechStack([])}
            disabled={pending}
          >
            Nhập dự án mới
          </Button>
        ) : null}
      </div>
    </form>
  );
}
