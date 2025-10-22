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
      className="text-sm font-medium text-foreground/80 transition hover:text-foreground disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
