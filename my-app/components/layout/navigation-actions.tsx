"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/layout/account-menu";
import { ROUTES } from "@/lib/routes";

type User = {
  id: number;
  email: string;
  roles?: string[];
} | null;

function describePrimaryRole(roles: string[] | undefined) {
  if (!roles || roles.length === 0) {
    return null;
  }
  if (roles.includes("SUPER_ADMIN")) return "Quản trị cấp cao";
  if (roles.includes("COMPANY_ADMIN")) return "Quản trị viên công ty";
  if (roles.includes("RECRUITER")) return "Nhà tuyển dụng";
  if (roles.includes("CANDIDATE")) return "Ứng viên";
  return roles[0];
}

export function NavigationActions({ currentUser }: { currentUser: User }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center gap-2">
        <Link href={ROUTES.signIn} className="hidden sm:inline-flex">
          <Button variant="ghost" size="sm" className="font-semibold">
            Đăng nhập
          </Button>
        </Link>
        <Link href={ROUTES.register}>
          <Button size="sm" className="font-bold shadow-sm">Bắt đầu ngay</Button>
        </Link>
      </div>
    );
  }

  const roleLabel = describePrimaryRole(currentUser.roles);
  const emailLabel = currentUser.email || "Người dùng đã xác thực";

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="hidden flex-col text-right sm:flex">
        <span className="font-semibold text-slate-900">{emailLabel}</span>
        {roleLabel ? <span className="text-xs text-indigo-600 font-medium">{roleLabel}</span> : null}
      </div>
      <AccountMenu />
    </div>
  );
}
