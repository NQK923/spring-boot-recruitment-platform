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

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
      }),
    []
  );

  const formatJoinedAt = useCallback(
    (value?: string | null) => {
      if (!value) {
        return "Recently added";
      }
      try {
        return dateFormatter.format(new Date(value));
      } catch {
        return value;
      }
    },
    [dateFormatter]
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
      <div className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-6 text-sm text-foreground/60">
        No team members yet. Send invites so recruiters can start collaborating.
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

      <p className="rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 text-xs text-foreground/60">
        Roles are now fixed once a teammate joins. Remove the member and send a new invitation if you need them to
        take on a different role.
      </p>

      {users.map((user) => {
        const isRecruiter = user.role.toUpperCase() === "RECRUITER";
        const isCompanyAdmin = user.role.toUpperCase() === "COMPANY_ADMIN";
        const isDisabled = isPending && pendingUserId === user.id;

        return (
          <div
            key={user.id}
            className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-surface/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{user.email}</p>
              <p className="text-xs text-foreground/60">Joined {formatJoinedAt(user.joinedAt)}</p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em]">
                <span className="rounded-full bg-foreground/5 px-2 py-1 text-foreground/70">{user.role}</span>
                <span
                  className={cx(
                    "rounded-full px-2 py-1",
                    user.locked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                  )}
                >
                  {user.locked ? "Locked" : "Active"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
                <span>Role</span>
                <span className="rounded-lg bg-foreground/5 px-3 py-1 text-foreground/70">
                  {user.role.replace("_", " ")}
                </span>
              </div>

              {isRecruiter ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isDisabled}
                  className={cx(
                    "border transition",
                    user.locked
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  )}
                  onClick={() => handleLockToggle(user.id, !user.locked)}
                >
                  {user.locked ? "Unlock recruiter" : "Lock recruiter"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled
                  className="text-foreground/60"
                >
                  {isCompanyAdmin ? "Company admin" : "Managed externally"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
