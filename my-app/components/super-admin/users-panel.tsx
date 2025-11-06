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
      <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
        {companyName} chưa có thành viên nào. Gửi lời mời để đội tuyển dụng bắt đầu sử dụng.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {alert ? (
        <p
          className={cx(
            "rounded-xl border px-4 py-2 text-xs font-semibold",
            alert.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
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
            className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{user.email}</p>
              <p className="text-xs text-foreground/60">Tham gia {describeJoinedAt(user.joinedAt)}</p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em]">
                <span className="rounded-full bg-foreground/5 px-2 py-1 text-foreground/70">{formatRole(normalizedRole)}</span>
                <span
                  className={cx(
                    "rounded-full px-2 py-1",
                    isLocked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                  )}
                >
                  {isLocked ? "Đã khóa" : "Đang hoạt động"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
                <span>Trạng thái</span>
                <span
                  className={cx(
                    "rounded-lg px-3 py-1",
                    isLocked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                  )}
                >
                  {isLocked ? "Đã khóa" : "Đang hoạt động"}
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isProcessing}
                onClick={() => toggleLock(user.id, !isLocked)}
                className={cx(
                  "min-w-[140px]",
                  isLocked
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                )}
              >
                {isProcessing ? "Đang cập nhật..." : isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
              </Button>
            </div>
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
