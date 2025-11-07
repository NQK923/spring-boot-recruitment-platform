"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ROUTES } from "@/lib/routes";

export function AccountMenu() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await fetch("/api/logout", { method: "POST" });
      router.replace(ROUTES.signIn);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-5 text-sm font-bold text-red-700 shadow-sm transition-all hover:border-red-300 hover:shadow-lg hover:-translate-y-0.5 hover:from-red-100 hover:to-rose-100 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0"
      disabled={pending}
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
          Đang đăng xuất...
        </>
      ) : (
        <>
          <span aria-hidden>🚪</span>
          Đăng xuất
        </>
      )}
    </button>
  );
}
