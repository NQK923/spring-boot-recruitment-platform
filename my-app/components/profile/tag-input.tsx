"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TagInputProps = {
  label?: string;
  placeholder?: string;
  values: string[];
  onChangeAction: (values: string[]) => void;
  disabled?: boolean;
};

export function TagInput({ label, placeholder, values, onChangeAction, disabled }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addValue = () => {
    const normalized = draft.trim();
    if (!normalized) return;
    if (values.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      setDraft("");
      return;
    }
    onChangeAction([...values, normalized]);
    setDraft("");
  };

  const removeValue = (index: number) => {
    onChangeAction(values.filter((_, idx) => idx !== index));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === ";") {
      event.preventDefault();
      addValue();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label ? <span className="text-sm font-semibold text-gray-900">{label}</span> : null}
      <div className="rounded-2xl border border-primary-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
            >
              {value}
              <button
                type="button"
                className="text-primary-600 hover:text-primary-800"
                onClick={() => removeValue(index)}
                disabled={disabled}
                aria-label={`Xoá ${value}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? "Nhập rồi nhấn Enter"}
            disabled={disabled}
            className="flex-1"
          />
          <Button type="button" size="sm" variant="secondary" onClick={addValue} disabled={disabled}>
            Thêm
          </Button>
        </div>
      </div>
    </div>
  );
}
