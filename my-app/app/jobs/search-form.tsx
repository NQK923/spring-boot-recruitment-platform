"use client"

import { FormEvent, useEffect, useState, useTransition } from "react";
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
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function updateRoute(nextQuery: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    if (nextQuery.trim().length > 0) {
      nextSearchParams.set("search", nextQuery.trim());
    } else {
      nextSearchParams.delete("search");
    }

    const queryString = nextSearchParams.toString();
    const target = queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
    startTransition(() => router.push(target));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateRoute(query);
  }

  function handleClear() {
    setQuery("");
    updateRoute("");
  }

  return (
    <form className={cx("flex w-full flex-col gap-3 sm:flex-row", className)} onSubmit={handleSubmit}>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by title, location, or keywords"
        aria-label="Search open roles"
        autoComplete="off"
      />
      <div className="flex gap-2 sm:w-auto">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Searching..." : "Search"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="whitespace-nowrap"
          disabled={isPending || query.length === 0}
          onClick={handleClear}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
