"use client";

import { useActionState } from "react";
import {
  createCertificationAction,
  deleteCertificationAction,
  updateCertificationAction,
  type ProfileFormState,
} from "@/app/candidate/profile/actions";
import type { Certification } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CertificationsFormProps = {
  certifications: Certification[];
};

const initialState: ProfileFormState = {};

export function CertificationsForm({ certifications }: CertificationsFormProps) {
  return (
    <div className="space-y-6">
      {certifications.map((certification) => (
        <EditableCertificationCard key={certification.id} certification={certification} />
      ))}
      <CreateCertificationCard />
    </div>
  );
}

function EditableCertificationCard({ certification }: { certification: Certification }) {
  const [state, formAction, pending] = useActionState(updateCertificationAction, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteCertificationAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-primary-200/60 bg-white/80 px-4 py-5 shadow-sm">
      <input type="hidden" name="certificationId" value={String(certification.id)} />
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <label className="flex-1 text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Tên chứng chỉ</span>
          <Input
            name="name"
            defaultValue={certification.name ?? ""}
            placeholder="Professional Scrum Master"
            disabled={pending}
          />
        </label>
        <label className="flex-1 text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Đơn vị cấp</span>
          <Input
            name="issuer"
            defaultValue={certification.issuer ?? ""}
            placeholder="Scrum.org"
            disabled={pending}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Ngày cấp</span>
          <Input type="date" name="issueDate" defaultValue={certification.issueDate ?? ""} disabled={pending} />
        </label>
        <label className="text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Ngày hết hạn</span>
          <Input type="date" name="expireDate" defaultValue={certification.expireDate ?? ""} disabled={pending} />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <label className="flex-1 text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Credential ID</span>
          <Input
            name="credentialId"
            defaultValue={certification.credentialId ?? ""}
            placeholder="ABC-12345"
            disabled={pending}
          />
        </label>
        <label className="flex-1 text-sm text-muted">
          <span className="mb-1 block font-semibold text-text">Đường dẫn xác thực</span>
          <Input
            name="credentialUrl"
            defaultValue={certification.credentialUrl ?? ""}
            placeholder="https://..."
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
          {pending ? "Đang lưu..." : "Lưu chứng chỉ"}
        </Button>
        <Button
          type="submit"
          formAction={deleteAction}
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700"
          disabled={deletePending}
        >
          {deletePending ? "Đang xoá..." : "Xoá chứng chỉ"}
        </Button>
      </div>
      {deleteState?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {deleteState.error}
        </p>
      ) : null}
    </form>
  );
}

function CreateCertificationCard() {
  const [state, formAction, pending] = useActionState(createCertificationAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-dashed border-primary-300 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 px-4 py-5"
    >
      <p className="text-sm font-semibold text-gray-900">Thêm chứng chỉ mới</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Input name="name" placeholder="Tên chứng chỉ" disabled={pending} />
        <Input name="issuer" placeholder="Đơn vị cấp" disabled={pending} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="date" name="issueDate" disabled={pending} />
        <Input type="date" name="expireDate" disabled={pending} />
      </div>
      <Input name="credentialId" placeholder="Credential ID" disabled={pending} />
      <Input name="credentialUrl" placeholder="Đường dẫn xác thực" disabled={pending} />
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
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Đang thêm..." : "Thêm chứng chỉ"}
      </Button>
    </form>
  );
}
