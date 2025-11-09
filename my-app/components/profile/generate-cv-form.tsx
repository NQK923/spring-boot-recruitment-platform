"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type GenerateStatus =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function GenerateCvForm() {
  const [templateCode, setTemplateCode] = useState("modern-1");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [tone, setTone] = useState<"neutral" | "formal">("neutral");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<GenerateStatus>({ type: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus({ type: "idle" });
    try {
      await downloadCv({ templateCode, language, tone });
      setStatus({
        type: "success",
        message:
          "Đã tạo CV tự động. Hãy kiểm tra file vừa tải và tự upload lên mục Quản lý CV nếu muốn lưu bản chính thức.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tạo CV tự động.";
      setStatus({ type: "error", message });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-primary-200/60 bg-gradient-to-br from-white to-primary-50/40 p-5 shadow-sm"
    >
      <div className="space-y-1">
        <p className="text-base font-semibold text-gray-900">Tạo CV tự động</p>
        <p className="text-sm text-gray-600">
          Gemini sẽ đọc toàn bộ hồ sơ và trả file PDF để bạn tải trực tiếp.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-semibold text-gray-900">
          Mẫu
          <select
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none"
            value={templateCode}
            onChange={(event) => setTemplateCode(event.target.value)}
            disabled={pending}
          >
            <option value="modern-1">Modern 01 - ATS</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-gray-900">
          Ngôn ngữ
          <select
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none"
            value={language}
            onChange={(event) => setLanguage(event.target.value as "vi" | "en")}
            disabled={pending}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-gray-900">
          Giọng văn
          <select
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none"
            value={tone}
            onChange={(event) => setTone(event.target.value as "neutral" | "formal")}
            disabled={pending}
          >
            <option value="neutral">Trung lập</option>
            <option value="formal">Trang trọng</option>
          </select>
        </label>
      </div>

      {status.type === "error" ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {status.message}
        </p>
      ) : null}
      {status.type === "success" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {status.message}
        </p>
      ) : null}

      <Button type="submit" size="sm" disabled={pending} className="px-6">
        {pending ? "Đang tạo..." : "Tạo CV tự động"}
      </Button>
    </form>
  );
}

async function downloadCv(opts: {
  templateCode?: string;
  language?: string;
  tone?: string;
}) {
  if (!API_BASE_URL) {
    throw new Error("Chưa cấu hình NEXT_PUBLIC_API_BASE_URL.");
  }
  const response = await fetch(`${API_BASE_URL}/api/profiles/me/cvs/generate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(opts ?? {}),
  });

  if (!response.ok) {
    let message = "Không thể tạo CV.";
    try {
      const payload = await response.json();
      if (payload?.message) {
        message = payload.message as string;
      }
    } catch {
      // ignore body parse error
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="(.+?)"/i);
  const filename = match?.[1] ?? "CV.pdf";
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
