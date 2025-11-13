"use client";

import { useActionState } from "react";
import {
  takeOwnershipAction,
  type ActionState,
} from "@/app/dashboard/applications/[applicationId]/actions";

type Props = {
  applicationId: number;
};

const initialState: ActionState = {};

export function TakeOwnershipButton({ applicationId }: Props) {
  const [state, formAction, pending] = useActionState(
    takeOwnershipAction.bind(null, applicationId),
    initialState
  );

  return (
    <form className="space-y-2 text-right" action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-300/50 transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Đang tiếp nhận...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Tiếp nhận hồ sơ
          </>
        )}
      </button>
      {state?.error ? (
        <p className="text-sm font-medium text-rose-600">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm font-medium text-emerald-600">{state.success}</p>
      ) : null}
    </form>
  );
}
