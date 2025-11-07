"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { generateCvAction, type ProfileFormState } from "@/app/candidate/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ProfileFormState = {};

export function GenerateCvForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(generateCvAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state?.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-2xl border border-primary-200/60 bg-gradient-to-br from-white to-primary-50/20 p-5 shadow-sm"
    >
      <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
        Tên phiên bản
        <Input
          name="generatedVersionName"
          placeholder="Sinh viên mới tốt nghiệp - Rút gọn"
          disabled={pending}
          required
        />
      </label>
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Đang tạo..." : "Tạo mẫu CV"}
      </Button>
    </form>
  );
}
