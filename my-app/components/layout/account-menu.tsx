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
      className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-5 text-sm font-bold text-red-700 shadow-sm transition-all hover:border-red-300 hover:shadow-lg hover:-translate-y-0.5 hover:from-red-100 hover:to-rose-100 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0"
      disabled={pending}
    >
      {pending ? (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Đang đăng xuất...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </>
      )}
    </button>
  );
}
