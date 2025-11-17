"use client";

import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import type { JobPostingPublic, PaginatedResponse } from "@/lib/types";
import { cx } from "@/lib/cx";
import { JobsSearchForm } from "./search-form";

type JobsResultsProps = {
  pageData: PaginatedResponse<JobPostingPublic>;
  hasQuery: boolean;
  currentUiPage: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  isSearching: boolean;
  onPageChange: (page: number) => void;
  onNavigateToJob: (jobId: number) => void;
  errorMessage?: string | null;
};

type FilterOption = {
  label: string;
  value: string;
};

export function JobsResults({
  pageData,
  hasQuery,
  currentUiPage,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  isSearching,
  onPageChange,
  onNavigateToJob,
  errorMessage,
}: JobsResultsProps) {
  const [workTypeFilter, setWorkTypeFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);

  const jobs = useMemo<JobPostingPublic[]>(() => pageData.items ?? [], [pageData.items]);
  const totalItems = pageData.totalItems ?? 0;
  const totalPages = pageData.totalPages ?? 0;
  const pageSize = pageData.size ?? (jobs.length > 0 ? jobs.length : 12);
  const serverPage = pageData.page ?? 0;
  const currentPage = Math.max(currentUiPage, 1);
  const hasPageResults = jobs.length > 0;

  const pageStart = hasPageResults ? serverPage * pageSize + 1 : 0;
  const pageEnd = hasPageResults ? pageStart + jobs.length - 1 : 0;

  const workTypeOptions = useMemo(() => getTopOptions(jobs.map((job) => job.workType)), [jobs]);
  const locationOptions = useMemo(() => getTopOptions(jobs.map((job) => job.location), 5), [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const normalizedWorkType = normalize(job.workType);
      const normalizedLocation = normalize(job.location);

      const matchesWorkType = workTypeFilter ? normalizedWorkType === workTypeFilter : true;
      const matchesLocation = locationFilter ? normalizedLocation === locationFilter : true;
      return matchesWorkType && matchesLocation;
    });
  }, [jobs, workTypeFilter, locationFilter]);

  const hasClientFilters = Boolean(workTypeFilter || locationFilter);
  const hasQuickFilters = workTypeOptions.length > 0 || locationOptions.length > 0;
  const showFiltersPanel = hasQuickFilters || hasClientFilters;

  const basePageLabel =
    totalItems === 0
      ? ""
      : hasPageResults
        ? `Đang hiển thị ${pageStart}-${pageEnd} trong tổng số ${totalItems} vị trí.`
        : "Trang này chưa có vị trí nào. Hãy thử số trang khác.";

  const filteredLabel = hasClientFilters
    ? filteredJobs.length === 0
      ? "Các bộ lọc đã loại bỏ toàn bộ vị trí trên trang này. Hãy xóa bộ lọc để xem lại tất cả."
      : `Sau khi áp dụng bộ lọc, còn ${filteredJobs.length} vị trí trên trang này.`
    : "";

  const resultsLabel = [basePageLabel, filteredLabel].filter(Boolean).join(" ");

  const emptyStateMessage = hasClientFilters
    ? "Không có vị trí nào khớp với bộ lọc hiện tại. Gỡ bỏ bộ lọc để xem lại tất cả."
    : totalItems === 0
      ? hasQuery
        ? "Không có vị trí nào khớp với từ khóa đó. Thử mở rộng từ khóa hoặc đặt lại tìm kiếm."
        : "Chưa có việc làm nào vào lúc này. Hãy quay lại sau hoặc đăng nhập để nhận gợi ý phù hợp."
      : "Trang này chưa có vị trí nào. Hãy thử số trang khác.";

  function clearFilters() {
    setWorkTypeFilter(null);
    setLocationFilter(null);
  }

  const createCardKeyDownHandler = (jobId: number) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onNavigateToJob(jobId);
    }
  };

  const shouldShowPagination = !hasClientFilters;

  return (
    <div className="space-y-6">
      <Panel padding="lg" className="space-y-6 border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
        <div className="space-y-2">
          <p className="text-base font-bold text-slate-900">🔍 Tìm kiếm vị trí tuyển dụng</p>
        </div>

        <JobsSearchForm
          query={searchQuery}
          onQueryChange={onSearchChange}
          onSubmit={onSearchSubmit}
          onClear={onSearchClear}
          isPending={isSearching}
        />

        <div className="space-y-4 border-t-2 border-blue-100 pt-5">
          {showFiltersPanel ? (
            <div className="space-y-4">
              {workTypeOptions.length > 0 && (
                <FilterRow
                  title="Hình thức làm việc"
                  options={workTypeOptions}
                  activeValue={workTypeFilter}
                  onToggle={(value) => setWorkTypeFilter((prev) => (prev === value ? null : value))}
                />
              )}

              {locationOptions.length > 0 && (
                <FilterRow
                  title="Khu vực"
                  options={locationOptions}
                  activeValue={locationFilter}
                  onToggle={(value) => setLocationFilter((prev) => (prev === value ? null : value))}
                />
              )}

              {hasClientFilters && (
                <Button variant="ghost" size="sm" className="whitespace-nowrap font-semibold" onClick={clearFilters}>
                  🗑️ Xóa bộ lọc nhanh
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500 font-medium">
              Bộ lọc nhanh sẽ hiển thị khi nhà tuyển dụng bổ sung thông tin hình thức làm việc hoặc địa điểm cho bài đăng.
            </p>
          )}

          {resultsLabel.length > 0 && <p className="text-sm text-slate-600 font-medium">{resultsLabel}</p>}
          {errorMessage && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{errorMessage}</p>
          )}
        </div>
      </Panel>

      {filteredJobs.length === 0 ? (
        <Panel padding="lg" className="border-2 border-slate-200 bg-slate-50 text-center text-base font-medium text-slate-600">
          {emptyStateMessage}
        </Panel>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              role="button"
              tabIndex={0}
              onClick={() => onNavigateToJob(job.id)}
              onKeyDown={createCardKeyDownHandler(job.id)}
              className="group flex h-full cursor-pointer flex-col focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
              aria-label={`Xem chi tiết cho ${job.title}`}
            >
              <Panel
                padding="lg"
                className="flex h-full flex-col gap-4 border-2 border-blue-200 bg-white transition-all duration-200 group-hover:border-indigo-300 group-hover:shadow-xl"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                    {job.title}
                  </h2>
                </div>

                <p className="line-clamp-4 text-sm leading-relaxed text-slate-600 font-medium">
                  {job.description ??
                    "Đội ngũ tuyển dụng đang chuẩn bị mô tả chi tiết. Vui lòng quay lại sau để xem trách nhiệm và yêu cầu."}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <JobMetaChip label={normalize(job.location) ?? "Nhiều địa điểm"} />
                  <JobMetaChip label={normalize(job.workType) ?? "Flexible work style"} />
                  {job.department && (
                    <JobMetaChip label={job.level ? `${job.department} / ${job.level}` : job.department} />
                  )}
                  {!job.department && job.level && <JobMetaChip label={job.level} />}
                </div>

                {job.salaryRange && (
                  <p className="text-sm font-bold text-slate-900">
                    <span className="text-slate-500">💰 Mức lương:</span> {job.salaryRange}
                  </p>
                )}

              </Panel>
            </div>
          ))}
        </div>
      )}

      {shouldShowPagination ? (
        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          hasNext={pageData.hasNext}
          hasPrevious={pageData.hasPrevious}
          onPageChange={onPageChange}
          isPending={isSearching}
          totalItems={totalItems}
          pageSize={pageSize}
        />
      ) : null}
    </div>
  );
}

type FilterRowProps = {
  title: string;
  options: FilterOption[];
  activeValue: string | null;
  onToggle: (value: string) => void;
};

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  isPending: boolean;
  totalItems: number;
  pageSize: number;
};

function PaginationControls({
  page,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  isPending,
  totalItems,
  pageSize,
}: PaginationControlsProps) {
  const effectiveTotalPages =
    totalPages > 0 ? totalPages : totalItems > 0 ? Math.max(Math.ceil(totalItems / Math.max(pageSize, 1)), 1) : 0;

  if (totalItems === 0 || effectiveTotalPages <= 1) {
    return null;
  }

  const disablePrev = isPending || (!hasPrevious && page <= 1);
  const disableNext = isPending || (!hasNext && page >= effectiveTotalPages);
  const summary = `Trang ${page}/${effectiveTotalPages} (tổng cộng ${totalItems} vị trí)`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-slate-900">{summary}</p>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disablePrev}
          aria-label="Trang trước"
          className="font-semibold"
        >
          ← Trước
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disableNext}
          aria-label="Trang tiếp theo"
          className="font-semibold"
        >
          Tiếp →
        </Button>
      </div>
    </div>
  );
}

function FilterRow({ title, options, activeValue, onToggle }: FilterRowProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterPill
            key={option.value}
            label={option.label}
            active={option.value === activeValue}
            onClick={() => onToggle(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-full border-2 px-4 py-2 text-xs font-bold transition-all",
        active
          ? "border-indigo-400 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
          : "border-blue-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
      )}
    >
      {label}
    </button>
  );
}

function JobMetaChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border-2 border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-700">
      {label}
    </span>
  );
}

function normalize(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getTopOptions(values: Array<string | null | undefined>, limit = 4): FilterOption[] {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const normalized = normalize(value);
    if (!normalized) {
      return;
    }
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => ({ label: value, value }));
}

function isRemoteFriendly(workType: string | null | undefined) {
  return Boolean(workType && workType.toLowerCase().includes("remote"));
}
