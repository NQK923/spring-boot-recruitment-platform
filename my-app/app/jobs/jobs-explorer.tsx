"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { PaginatedResponse, JobPostingPublic } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { JobsResults } from "./results";

type JobsExplorerProps = {
  initialQuery: string;
  initialPageData: PaginatedResponse<JobPostingPublic>;
  pageSize: number;
};

const FALLBACK_ERROR = "Không thể tải danh sách công việc. Vui lòng thử lại sau.";
const JOBS_PROXY_PATH = "/api/jobs/public";

export function JobsExplorer({ initialQuery, initialPageData, pageSize }: JobsExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery.trim());
  const [pageData, setPageData] = useState(initialPageData);
  const [uiPage, setUiPage] = useState(Math.max(initialPageData.page ?? 0, 0) + 1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const effectivePageSize = useMemo(() => pageSize || initialPageData.size || 12, [pageSize, initialPageData.size]);
  const skipNextDebounceRef = useRef(true);
  const debounceHandleRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 450;

  const hasQuery = activeQuery.length > 0;

  const updateUrl = useCallback(
    (query: string, page: number) => {
      const params = new URLSearchParams();
      const trimmed = query.trim();
      if (trimmed.length > 0) {
        params.set("search", trimmed);
      }
      if (page > 1) {
        params.set("page", String(page));
      }
      const queryString = params.toString();
      const target = queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
      window.history.replaceState(null, "", target);
    },
    [pathname]
  );

  const fetchJobs = useCallback(
    async (query: string, nextUiPage: number) => {
      const params = new URLSearchParams();
      const trimmed = query.trim();
      if (trimmed.length > 0) {
        params.set("search", trimmed);
      }
      params.set("page", String(Math.max(nextUiPage - 1, 0)));
      params.set("size", String(effectivePageSize));
      const search = params.toString();
      const targetUrl = search.length > 0 ? `${JOBS_PROXY_PATH}?${search}` : JOBS_PROXY_PATH;
      const response = await fetch(targetUrl, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        const body = await safeJson(response);
        const message =
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : FALLBACK_ERROR;
        throw new Error(message);
      }
      const data = (await response.json()) as PaginatedResponse<JobPostingPublic>;
      return data;
    },
    [effectivePageSize]
  );

  const runSearch = useCallback(
    (nextQuery: string, nextUiPage: number) => {
      startTransition(async () => {
        try {
          setErrorMessage(null);
          const data = await fetchJobs(nextQuery, nextUiPage);
          setPageData(data);
          setUiPage(Math.max(data.page ?? 0, 0) + 1);
          setActiveQuery(nextQuery.trim());
          updateUrl(nextQuery, nextUiPage);
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : FALLBACK_ERROR);
        }
      });
    },
    [fetchJobs, updateUrl]
  );

  const handleSearchSubmit = useCallback(() => {
    skipNextDebounceRef.current = true;
    runSearch(inputValue, 1);
  }, [inputValue, runSearch]);

  const handleClearSearch = useCallback(() => {
    setInputValue("");
    skipNextDebounceRef.current = true;
    runSearch("", 1);
  }, [runSearch]);

  const handlePageChange = useCallback(
    (targetPage: number) => {
      if (targetPage === uiPage || targetPage < 1) {
        return;
      }
      runSearch(activeQuery, targetPage);
    },
    [activeQuery, runSearch, uiPage]
  );

  const handleNavigateToJob = useCallback(
    (jobId: number) => {
      router.push(`${ROUTES.jobs}/${jobId}`);
    },
    [router]
  );

  useEffect(() => {
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return () => {
        if (debounceHandleRef.current) {
          clearTimeout(debounceHandleRef.current);
        }
      };
    }

    if (debounceHandleRef.current) {
      clearTimeout(debounceHandleRef.current);
    }

    debounceHandleRef.current = setTimeout(() => {
      runSearch(inputValue, 1);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceHandleRef.current) {
        clearTimeout(debounceHandleRef.current);
      }
    };
  }, [inputValue, runSearch]);

  return (
    <JobsResults
      pageData={pageData}
      hasQuery={hasQuery}
      currentUiPage={uiPage}
      searchQuery={inputValue}
      onSearchChange={setInputValue}
      onSearchSubmit={handleSearchSubmit}
      onSearchClear={handleClearSearch}
      isSearching={isPending}
      onPageChange={handlePageChange}
      onNavigateToJob={handleNavigateToJob}
      errorMessage={errorMessage}
    />
  );
}

async function safeJson(response: Response) {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
}
