"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { updateCompanyUserAction } from "@/app/dashboard/company/actions";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";

type CompanyMember = {
  id: number;
  email: string;
  role: string;
  joinedAt?: string | null;
  locked: boolean;
};

type Props = {
  users: CompanyMember[];
};

type AlertState =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

export function CompanyMembersPanel({ users }: Props) {
  const [alert, setAlert] = useState<AlertState>(null);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
    useMemo(
        () =>
            new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
            }),
        []
    );

    const mutateMember = useCallback((userId: number, payload: Parameters<typeof updateCompanyUserAction>[1]) => {
        setAlert(null);
        setPendingUserId(userId);
        startTransition(() => {
            void (async () => {
                const result = await updateCompanyUserAction(userId, payload);
                if (result.error) {
                    setAlert({ type: "error", message: result.error });
                } else if (result.success) {
                    setAlert({ type: "success", message: result.success });
                }
                setPendingUserId(null);
            })();
        });
    }, []);
    const handleLockToggle = useCallback(
    (userId: number, shouldLock: boolean) => {
      mutateMember(userId, { locked: shouldLock });
    },
    [mutateMember]
  );

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-blue-100 bg-white px-6 py-8 text-center text-base text-slate-600 shadow-sm">
        Chưa có thành viên nào. Gửi lời mời để nhà tuyển dụng bắt đầu cộng tác.
      </div>
    );
  }

  return (
    <div className="space-y-5 text-sm">
      {alert ? (
        <p
          className={cx(
            "rounded-xl border-2 px-5 py-3 text-sm font-bold",
            alert.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          )}
        >
          {alert.message}
        </p>
      ) : null}

      <p className="rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50/50 px-5 py-4 text-sm leading-relaxed text-slate-700">
        Vai trò sẽ cố định khi thành viên tham gia. Nếu cần đổi vai trò, hãy gỡ thành viên và gửi lời mời mới.
      </p>

      {users.map((user) => {
        const isRecruiter = user.role.toUpperCase() === "RECRUITER";
        const isCompanyAdmin = user.role.toUpperCase() === "COMPANY_ADMIN";
        const isDisabled = isPending && pendingUserId === user.id;

        return (
          <div
            key={user.id}
            className="flex flex-col gap-4 rounded-2xl border-2 border-blue-100 bg-white px-6 py-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-2">
              <p className="text-base font-bold text-slate-900">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="rounded-full border-2 border-blue-200 bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-white shadow-sm">{formatRole(user.role)}</span>
                <span
                  className={cx(
                    "rounded-full border-2 px-4 py-2 shadow-sm",
                    user.locked ? "border-red-200 bg-gradient-to-r from-red-600 to-orange-500 text-white" : "border-emerald-200 bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
                  )}
                >
                  {user.locked ? "Đã khóa" : "Hoạt động"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {isRecruiter ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isDisabled}
                  className={cx(
                    "border-2 transition",
                    user.locked
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  )}
                  onClick={() => handleLockToggle(user.id, !user.locked)}
                >
                  {user.locked ? "Mở khóa nhà tuyển dụng" : "Khóa nhà tuyển dụng"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled
                  className="text-slate-600"
                >
                  {isCompanyAdmin ? "Quản trị viên công ty" : "Quản lý bên ngoài"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatRole(role: string) {
  const normalized = role.toUpperCase();
  if (normalized === "COMPANY_ADMIN") return "Quản trị viên công ty";
  if (normalized === "RECRUITER") return "Nhà tuyển dụng";
  if (normalized === "SUPER_ADMIN") return "Quản trị cấp cao";
  if (normalized === "MANAGED_EXTERNALLY") return "Quản lý bên ngoài";
  return role.replace(/_/g, " ");
}
