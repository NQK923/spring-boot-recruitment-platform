"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction, type ProfileFormState } from "@/app/candidate/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  fullName?: string | null;
  phoneNumber?: string | null;
  summary?: string | null;
};

const initialState: ProfileFormState = {};

export function UpdateProfileForm({ fullName, phoneNumber, summary }: Props) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.refresh();
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [router, state?.success]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Họ và tên
          <Input
            name="fullName"
            defaultValue={fullName ?? ""}
            placeholder="Nguyễn Văn A"
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Số điện thoại
          <Input
            name="phoneNumber"
            defaultValue={phoneNumber ?? ""}
            placeholder="+84 900 000 000"
            disabled={pending}
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
        Tóm tắt bản thân
        <textarea
          name="summary"
          defaultValue={summary ?? ""}
          placeholder="Chia sẻ tóm tắt ngắn gọn để nhà tuyển dụng hiểu động lực của bạn."
          disabled={pending}
          rows={4}
          className="min-h-[120px] rounded-2xl border border-primary-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
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
      <Button type="submit" size="md" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
