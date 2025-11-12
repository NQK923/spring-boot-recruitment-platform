"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfileDetailsAction, type ProfileFormState } from "@/app/candidate/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";

type Props = {
  fullName?: string | null;
  phoneNumber?: string | null;
  summary?: string | null;
  emailForCv?: string | null;
  location?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  yearsOfExperience?: number | null;
  desiredPosition?: string | null;
  workAuthorization?: string | null;
  openToRelocate?: boolean;
  preferredCvLanguage?: "vi" | "en" | null;
};

const initialState: ProfileFormState = {};

export function UpdateProfileForm({
  fullName,
  phoneNumber,
  summary,
  emailForCv,
  location,
  website,
  linkedin,
  github,
  portfolio,
  yearsOfExperience,
  desiredPosition,
  workAuthorization,
  openToRelocate,
  preferredCvLanguage,
}: Props) {
  const [state, formAction, pending] = useActionState(updateProfileDetailsAction, initialState);
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
    <form action={formAction} className="space-y-6">
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

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Email dùng trên CV
          <Input
            name="emailForCv"
            defaultValue={emailForCv ?? ""}
            placeholder="ban@example.com"
            type="email"
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Vị trí mong muốn
          <Input
            name="desiredPosition"
            defaultValue={desiredPosition ?? ""}
            placeholder="Senior Product Designer"
            disabled={pending}
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Kinh nghiệm tổng (năm)
          <Input
            name="yearsOfExperience"
            type="number"
            min={0}
            max={60}
            defaultValue={yearsOfExperience ?? ""}
            placeholder="5"
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Quyền làm việc / Visa
          <Input
            name="workAuthorization"
            defaultValue={workAuthorization ?? ""}
            placeholder="Toàn thời gian tại Việt Nam"
            disabled={pending}
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Thành phố đang sinh sống
          <Input
            name="location"
            defaultValue={location ?? ""}
            placeholder="Hà Nội, Việt Nam"
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Sẵn sàng chuyển nơi làm việc
          <span className="flex items-center gap-3 rounded-2xl border border-primary-200/80 bg-white px-4 py-3 text-sm font-normal text-gray-800">
            <input
              type="checkbox"
              name="openToRelocate"
              defaultChecked={Boolean(openToRelocate)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={pending}
            />
            Tôi có thể chuyển nơi làm việc nếu phù hợp
          </span>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
        Tóm tắt bản thân
        <AutoResizeTextarea
          name="summary"
          defaultValue={summary ?? ""}
          placeholder="Tóm tắt 3-4 câu về thành tựu nổi bật, số liệu chính và giá trị bạn mang lại."
          disabled={pending}
          minRows={4}
          maxRows={15}
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Website cá nhân
          <Input
            name="website"
            defaultValue={website ?? ""}
            placeholder="https://yourname.me"
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          LinkedIn
          <Input
            name="linkedin"
            defaultValue={linkedin ?? ""}
            placeholder="https://www.linkedin.com/in/tenban"
            disabled={pending}
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          GitHub
          <Input
            name="github"
            defaultValue={github ?? ""}
            placeholder="https://github.com/username"
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Portfolio
          <Input
            name="portfolio"
            defaultValue={portfolio ?? ""}
            placeholder="https://dribbble.com/username"
            disabled={pending}
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
          Ngôn ngữ CV mặc định
          <select
            name="preferredCvLanguage"
            defaultValue={preferredCvLanguage ?? "vi"}
            disabled={pending}
            className="rounded-2xl border border-primary-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">Tiếng Anh</option>
          </select>
        </label>
      </div>

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
        {pending ? "Đang lưu..." : "Lưu thông tin"}
      </Button>
    </form>
  );
}
