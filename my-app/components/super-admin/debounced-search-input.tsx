"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";

type DebouncedSearchInputProps = {
  param: string;
  placeholder: string;
  initialValue?: string;
  debounceMs?: number;
  className?: string;
  inputClassName?: string;
  searchLabel?: string;
  clearLabel?: string;
};

const DEFAULT_DEBOUNCE_MS = 400;

export function DebouncedSearchInput({
  param,
  placeholder,
  initialValue = "",
  debounceMs = DEFAULT_DEBOUNCE_MS,
  className,
  inputClassName,
  searchLabel = "Search",
  clearLabel = "Clear",
}: DebouncedSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialValue);
  const [lastApplied, setLastApplied] = useState(initialValue.trim());
  const initializedRef = useRef(false);

  const normalizedValue = useMemo(() => value.trim(), [value]);

  useEffect(() => {
    const normalizedInitial = initialValue.trim();
    setValue(initialValue);
    setLastApplied(normalizedInitial);
  }, [initialValue]);

  const applyValue = useCallback(
    (nextValue: string) => {
      const params = new URLSearchParams(searchString);
      if (nextValue) {
        params.set(param, nextValue);
      } else {
        params.delete(param);
      }
      const query = params.toString();
      const target = query ? `${pathname}?${query}` : pathname;
      setLastApplied(nextValue);
      startTransition(() => {
        router.replace(target, { scroll: false });
      });
    },
    [param, pathname, router, searchString]
  );

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    if (normalizedValue === lastApplied) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      applyValue(normalizedValue);
    }, debounceMs);
    return () => window.clearTimeout(timeoutId);
  }, [applyValue, debounceMs, lastApplied, normalizedValue]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  }, []);

  const handleSubmitClick = useCallback(() => {
    if (normalizedValue === lastApplied) {
      return;
    }
    applyValue(normalizedValue);
  }, [applyValue, lastApplied, normalizedValue]);

  const handleClear = useCallback(() => {
    if (!lastApplied && value === "") {
      return;
    }
    setValue("");
    applyValue("");
  }, [applyValue, lastApplied, value]);

  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-foreground/10 bg-surface/95 px-4 py-3",
        className
      )}
    >
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cx(
          "flex-1 min-w-[220px] rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground/40",
          inputClassName
        )}
      />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={handleSubmitClick}
        disabled={isPending || normalizedValue === lastApplied}
      >
        {isPending ? "Searching…" : searchLabel}
      </Button>
      {normalizedValue || lastApplied ? (
        <button
          type="button"
          onClick={handleClear}
          className="text-sm font-semibold text-foreground transition hover:text-accent"
        >
          {clearLabel}
        </button>
      ) : null}
    </div>
  );
}
