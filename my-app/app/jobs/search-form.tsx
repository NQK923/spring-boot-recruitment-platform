"use client";

import { FormEvent, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";

type JobsSearchFormProps = {
  initialQuery?: string;
  className?: string;
};

export function JobsSearchForm({ initialQuery = "", className }: JobsSearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const skipNextDebounceRef = useRef(true);
  const debounceHandleRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 450;

  const updateRoute = useCallback(
    (nextQuery: string) => {
      const nextSearchParams = new URLSearchParams(searchParamsString);
      if (nextQuery.trim().length > 0) {
        nextSearchParams.set("search", nextQuery.trim());
      } else {
        nextSearchParams.delete("search");
      }
      nextSearchParams.delete("page");

      const queryString = nextSearchParams.toString();
      const target = queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
      startTransition(() => router.push(target));
    },
    [pathname, router, searchParamsString]
  );

  const updateRouteRef = useRef(updateRoute);

  useEffect(() => {
    updateRouteRef.current = updateRoute;
  }, [updateRoute]);

  useEffect(() => {
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return;
    }

    if (debounceHandleRef.current) {
      clearTimeout(debounceHandleRef.current);
    }
    debounceHandleRef.current = setTimeout(() => {
      updateRouteRef.current(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceHandleRef.current) {
        clearTimeout(debounceHandleRef.current);
      }
    };
  }, [query]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    skipNextDebounceRef.current = true;
    updateRoute(query);
  }

  function handleClear() {
    setQuery("");
    skipNextDebounceRef.current = true;
    updateRoute("");
  }

  return (
    <form className={cx("flex w-full flex-col gap-3 sm:flex-row sm:items-center", className)} onSubmit={handleSubmit}>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
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
          onClick={handleClear}
        >
          ✕ Xóa
        </Button>
      </div>
    </form>
  );
}
