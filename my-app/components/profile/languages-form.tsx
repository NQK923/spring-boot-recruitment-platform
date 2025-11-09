"use client";

import { useActionState } from "react";
import {
  createLanguageAction,
  deleteLanguageAction,
  updateLanguageAction,
  type ProfileFormState,
} from "@/app/candidate/profile/actions";
import type { LanguageProficiency, ProfileLanguage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LANGUAGE_OPTIONS: Array<{ label: string; value: LanguageProficiency }> = [
  { label: "A1 - Beginner", value: "A1" },
  { label: "A2 - Elementary", value: "A2" },
  { label: "B1 - Intermediate", value: "B1" },
  { label: "B2 - Upper Intermediate", value: "B2" },
  { label: "C1 - Advanced", value: "C1" },
  { label: "C2 - Mastery", value: "C2" },
  { label: "Fluent", value: "FLUENT" },
  { label: "Native", value: "NATIVE" },
];

type LanguagesFormProps = {
  languages: ProfileLanguage[];
};

const initialState: ProfileFormState = {};

export function LanguagesForm({ languages }: LanguagesFormProps) {
  return (
    <div className="space-y-6">
      {languages.map((language) => (
        <EditableLanguageRow key={language.id} language={language} />
      ))}
      <CreateLanguageRow />
    </div>
  );
}

function EditableLanguageRow({ language }: { language: ProfileLanguage }) {
  const [state, formAction, pending] = useActionState(updateLanguageAction, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteLanguageAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-primary-200/60 bg-white/80 px-4 py-4 shadow-sm sm:flex-row sm:items-center"
    >
      <input type="hidden" name="languageId" value={String(language.id)} />
      <div className="flex-1 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <Input
          name="language"
          defaultValue={language.language ?? ""}
          placeholder="Ngôn ngữ"
          disabled={pending}
          className="flex-1"
        />
        <select
          name="proficiency"
          defaultValue={language.proficiency ?? ""}
          disabled={pending}
          className="flex-1 rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
        >
          <option value="">Trình độ</option>
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu"}
        </Button>
        <Button
          type="submit"
          formAction={deleteAction}
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700"
          disabled={deletePending}
        >
          {deletePending ? "Đang xoá..." : "Xoá"}
        </Button>
      </div>
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.success}
        </p>
      ) : null}
      {deleteState?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {deleteState.error}
        </p>
      ) : null}
    </form>
  );
}

function CreateLanguageRow() {
  const [state, formAction, pending] = useActionState(createLanguageAction, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-primary-300 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 px-4 py-4 shadow-sm sm:flex-row sm:items-center"
    >
      <Input name="language" placeholder="Ngôn ngữ" disabled={pending} className="flex-1" />
      <select
        name="proficiency"
        defaultValue=""
        disabled={pending}
        className="flex-1 rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
      >
        <option value="">Trình độ</option>
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Đang thêm..." : "Thêm ngoại ngữ"}
      </Button>
      {state?.error ? (
        <p className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
