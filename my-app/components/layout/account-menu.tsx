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
      className="inline-flex h-9 items-center justify-center rounded-full border border-foreground/30 bg-surface px-4 text-sm font-medium text-text/80 transition hover:border-foreground/45 hover:text-text hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
