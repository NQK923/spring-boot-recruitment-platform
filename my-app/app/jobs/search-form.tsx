"use client";

import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";

type JobsSearchFormProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isPending?: boolean;
  className?: string;
};

export function JobsSearchForm({
  query,
  onQueryChange,
  onSubmit,
  onClear,
  isPending = false,
  className,
}: JobsSearchFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className={cx("flex w-full flex-col gap-3 sm:flex-row sm:items-center", className)} onSubmit={handleSubmit}>
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Tìm theo chức danh hoặc địa điểm"
        aria-label="Tìm vị trí tuyển dụng"
        autoComplete="off"
        className="flex-1"
      />
      <div className="flex shrink-0 gap-2">
        <Button type="submit" size="lg" disabled={isPending} className="whitespace-nowrap font-semibold">
          {isPending ? "Đang tìm..." : "🔍 Tìm kiếm"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="whitespace-nowrap font-semibold"
          disabled={isPending || query.length === 0}
          onClick={onClear}
        >
          ✕ Xóa
        </Button>
      </div>
    </form>
  );
}
