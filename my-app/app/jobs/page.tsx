import { Container } from "@/components/ui/container";
import { apiFetch } from "@/lib/api";
import type { JobPostingPublic, PaginatedResponse } from "@/lib/types";
import { JobsExplorer } from "./jobs-explorer";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 12;

type JobsPageResponse = PaginatedResponse<JobPostingPublic>;

const EMPTY_JOBS_PAGE: JobsPageResponse = {
  items: [],
  totalItems: 0,
  totalPages: 0,
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  hasNext: false,
  hasPrevious: false,
};

async function getPublicJobs(search: string, page: number, size: number): Promise<JobsPageResponse> {
  try {
    const params = new URLSearchParams();
    const normalizedSearch = search.trim();
    if (normalizedSearch.length > 0) {
      params.set("search", normalizedSearch);
    }
    params.set("page", String(page));
    params.set("size", String(size));
    const query = params.toString();
    const response = await apiFetch(`/api/jobs/public${query ? `?${query}` : ""}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "no-store",
    });
    const data = await response.json();
    if (data && typeof data === "object" && Array.isArray((data as JobsPageResponse).items)) {
      const pageData = data as JobsPageResponse;
      return {
        ...pageData,
        items: (pageData.items ?? []).filter((item): item is JobPostingPublic => Boolean(item)),
      };
    }
    return {
      ...EMPTY_JOBS_PAGE,
      page,
      size,
    };
  } catch {
    return {
      ...EMPTY_JOBS_PAGE,
      page,
      size,
    };
  }
}

type JobsPageProps = {
  searchParams?: Promise<{
    search?: string | string[];
    page?: string | string[];
  }> | {
    search?: string | string[];
    page?: string | string[];
  };
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const rawSearchValue = resolvedSearchParams?.search;
  const rawPageValue = resolvedSearchParams?.page;
  const rawSearch =
    typeof rawSearchValue === "string"
      ? rawSearchValue
      : Array.isArray(rawSearchValue) && rawSearchValue.length > 0
        ? rawSearchValue[0]
        : "";
  const pageParam =
    typeof rawPageValue === "string"
      ? rawPageValue
      : Array.isArray(rawPageValue) && rawPageValue.length > 0
        ? rawPageValue[0]
        : undefined;
  const normalizedSearch = rawSearch.trim();
  const uiPage = Number.parseInt(pageParam ?? "", 10);
  const currentPage = Number.isFinite(uiPage) && uiPage > 0 ? uiPage : 1;
  const backendPage = currentPage - 1;

  const jobsPage = await getPublicJobs(normalizedSearch, backendPage, DEFAULT_PAGE_SIZE);
  const effectiveUiPage = Math.max(jobsPage.page, 0) + 1;
  const hasQuery = normalizedSearch.length > 0;

  return (
    <Container className="flex flex-col gap-10 py-12">
      <header className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.32em] text-indigo-700">
              Khám phá cơ hội mới
            </span>
            <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Các vị trí đang tuyển</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="rounded-full border-2 border-blue-200 bg-blue-50 px-4 py-2 font-semibold text-blue-700">
            ✓ Vị trí mới được bổ sung hằng tuần
          </span>
          <span className="rounded-full border-2 border-indigo-200 bg-indigo-50 px-4 py-2 font-semibold text-indigo-700">
            ✓ Ghi chú từ nhà tuyển dụng được chia sẻ minh bạch
          </span>
          <span className="rounded-full border-2 border-purple-200 bg-purple-50 px-4 py-2 font-semibold text-purple-700">
            ✓ Theo dõi đơn ứng tuyển với cảnh báo trạng thái
          </span>
        </div>
      </header>

      <JobsExplorer initialQuery={rawSearch} initialPageData={jobsPage} pageSize={DEFAULT_PAGE_SIZE} />
    </Container>
  );
}
