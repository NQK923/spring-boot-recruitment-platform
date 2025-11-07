"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCompanyUserLockAction } from "@/app/dashboard/super-admin/actions";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";

type SuperAdminUser = {
  id: number;
  email: string;
  role: string;
  locked: boolean;
  joinedAt: string | null;
};

type AlertState =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

type SuperAdminUsersPanelProps = {
  companyId: number;
  companyName: string;
  users: SuperAdminUser[];
};

export function SuperAdminUsersPanel({ companyId, companyName, users }: SuperAdminUsersPanelProps) {
  const [alert, setAlert] = useState<AlertState>(null);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeZone: "UTC",
      }),
    []
  );

  const describeJoinedAt = useCallback(
    (value: string | null) => {
      if (!value) {
        return "Mới được thêm";
      }
      try {
        return dateFormatter.format(new Date(value));
      } catch {
        return value;
      }
    },
    [dateFormatter]
  );

  const toggleLock = useCallback(
    (userId: number, locked: boolean) => {
      setAlert(null);
      setPendingUserId(userId);
      startTransition(() => {
        void (async () => {
          try {
            const result = await updateCompanyUserLockAction({
              companyId,
              userId,
              locked,
            });

            if (result.error) {
              setAlert({ type: "error", message: result.error });
            } else if (result.success) {
              setAlert({ type: "success", message: result.success });
            }
          } catch {
            setAlert({ type: "error", message: "Có lỗi xảy ra. Vui lòng thử lại sau." });
          } finally {
            setPendingUserId(null);
            router.refresh();
          }
        })();
      });
    },
    [companyId, router]
  );

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-white to-amber-50 px-5 py-6 text-sm text-slate-700 font-medium">
        {companyName} chưa có thành viên nào. Gửi lời mời để đội tuyển dụng bắt đầu sử dụng.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {alert ? (
        <p
          className={cx(
            "rounded-xl border-2 px-4 py-3 text-sm font-bold",
            alert.type === "success"
              ? "border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700"
              : "border-red-300 bg-gradient-to-r from-red-50 to-pink-50 text-red-700"
          )}
        >
          {alert.message}
        </p>
      ) : null}

      {users.map((user) => {
        const isLocked = Boolean(user.locked);
        const normalizedRole = user.role.replace(/_/g, " ");
        const isProcessing = isPending && pendingUserId === user.id;

        return (
          <div
            key={`${companyId}-${user.id}`}
            className="flex flex-col gap-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-white to-blue-50 px-5 py-5 shadow-md hover:shadow-lg transition-shadow sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-2">
              <p className="font-bold text-slate-900 text-base">{user.email}</p>
              <p className="text-xs text-slate-600 font-medium">Tham gia {describeJoinedAt(user.joinedAt)}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider font-bold">
                <span className="rounded-full bg-gradient-to-r from-slate-100 to-gray-100 px-3 py-1 text-slate-700">{formatRole(normalizedRole)}</span>
                <span
                  className={cx(
                    "rounded-full px-3 py-1",
                    isLocked ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-700" : "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700"
                  )}
                >
                  {isLocked ? "🔒 Đã khóa" : "✅ Đang hoạt động"}
                </span>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isProcessing}
              onClick={() => toggleLock(user.id, !isLocked)}
              className={cx(
                "min-w-[160px] font-bold",
                isLocked
                  ? "border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:shadow-md"
                  : "border-2 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 hover:shadow-md"
              )}
            >
              {isProcessing ? "Đang cập nhật..." : isLocked ? "🔓 Mở khóa tài khoản" : "🔒 Khóa tài khoản"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function formatRole(role: string) {
  const normalized = role.toUpperCase().replace(/\s+/g, " ");
  const ROLE_LABELS: Record<string, string> = {
    "COMPANY ADMIN": "Quản trị viên công ty",
    RECRUITER: "Nhà tuyển dụng",
    "MANAGED EXTERNALLY": "Quản lý bên ngoài",
    "SUPER ADMIN": "Quản trị cấp cao",
  };
  if (ROLE_LABELS[normalized]) {
    return ROLE_LABELS[normalized];
  }
  return role;
}
