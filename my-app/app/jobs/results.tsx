"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import type { JobPostingPublic } from "@/lib/types";
import { cx } from "@/lib/cx";
import { JobsSearchForm } from "./search-form";

type JobsResultsProps = {
  jobs: JobPostingPublic[];
  hasQuery: boolean;
  initialQuery: string;
};

type FilterOption = {
  label: string;
  value: string;
};

export function JobsResults({ jobs, hasQuery, initialQuery }: JobsResultsProps) {
  const [workTypeFilter, setWorkTypeFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const normalizedQuery = initialQuery.trim();
  const searchLabel = normalizedQuery.length > 0 ? normalizedQuery : initialQuery;

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
  const searchSummary = hasQuery
    ? `Showing ${jobs.length} result${jobs.length === 1 ? "" : "s"} for "${searchLabel}".`
    : `Showing ${jobs.length} open role${jobs.length === 1 ? "" : "s"}.`;
  const resultsLabel = hasClientFilters
    ? `Showing ${filteredJobs.length} role${filteredJobs.length === 1 ? "" : "s"} after filters.`
    : `Showing ${filteredJobs.length} role${filteredJobs.length === 1 ? "" : "s"} from this search.`;

  function clearFilters() {
    setWorkTypeFilter(null);
    setLocationFilter(null);
  }

  return (
    <div className="space-y-6">
      <Panel padding="lg" className="space-y-6">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Search open roles</p>
          <p className="text-xs text-foreground/60">{searchSummary}</p>
        </div>

        <JobsSearchForm key={initialQuery} initialQuery={initialQuery} />

        <div className="space-y-4 border-t border-border/60 pt-4">
          {showFiltersPanel ? (
            <div className="space-y-4">
              {workTypeOptions.length > 0 && (
                <FilterRow
                  title="Work style"
                  options={workTypeOptions}
                  activeValue={workTypeFilter}
                  onToggle={(value) => setWorkTypeFilter((prev) => (prev === value ? null : value))}
                />
              )}

              {locationOptions.length > 0 && (
                <FilterRow
                  title="Location"
                  options={locationOptions}
                  activeValue={locationFilter}
                  onToggle={(value) => setLocationFilter((prev) => (prev === value ? null : value))}
                />
              )}

              {hasClientFilters && (
                <Button variant="ghost" size="sm" className="whitespace-nowrap" onClick={clearFilters}>
                  Clear quick filters
                </Button>
              )}
            </div>
          ) : (
            <p className="text-xs text-foreground/60">
              Quick filters will surface once recruiters add work style or location metadata to their postings.
            </p>
          )}

          <p className="text-xs text-foreground/60">{resultsLabel}</p>
        </div>
      </Panel>

      {filteredJobs.length === 0 ? (
        <Panel padding="lg" className="text-sm text-foreground/60">
          {hasClientFilters
            ? "Nothing matches those filters. Clear them to view every opening again."
            : hasQuery
              ? "No roles match that search. Try broader keywords or reset the search above."
              : "No jobs are available right now. Check back soon or sign in to receive tailored recommendations."}
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredJobs.map((job) => (
            <Panel key={job.id} padding="lg" className="flex h-full flex-col gap-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                  {jobStatusLabel(job.status)}
                </p>
                <h2 className="text-2xl font-semibold text-foreground">{job.title}</h2>
              </div>

              <p className="line-clamp-4 text-sm text-foreground/70">
                {job.description ??
                  "The hiring team is preparing a detailed description. Check back soon for responsibilities and requirements."}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <JobMetaChip label={normalize(job.location) ?? "Multiple locations"} />
                <JobMetaChip label={normalize(job.workType) ?? "Flexible work style"} />
                {job.department && (
                  <JobMetaChip label={job.level ? `${job.department} / ${job.level}` : job.department} />
                )}
                {!job.department && job.level && <JobMetaChip label={job.level} />}
              </div>

              {job.salaryRange && (
                <p className="text-xs font-medium text-foreground">
                  <span className="text-foreground/70">Compensation:</span> {job.salaryRange}
                </p>
              )}

              <div className="mt-auto flex flex-col gap-3 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-foreground/60">
                  {isRemoteFriendly(job.workType)
                    ? "Remote-friendly team with async collaboration."
                    : "Collaborative team with on-site rituals."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`${ROUTES.jobs}/${job.id}`}
                    className="font-semibold text-foreground transition hover:underline"
                  >
                    View full details
                  </Link>
                  <Link
                    href={`${ROUTES.signIn}?next=${ROUTES.jobs}/${job.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-border/80 px-4 py-2 text-xs font-semibold text-foreground transition hover:border-foreground"
                  >
                    Apply to this role
                  </Link>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

type FilterRowProps = {
  title: string;
  options: FilterOption[];
  activeValue: string | null;
  onToggle: (value: string) => void;
};

function FilterRow({ title, options, activeValue, onToggle }: FilterRowProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{title}</p>
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
        "rounded-full border border-border/80 px-3 py-1 text-xs font-medium text-foreground/70 transition hover:border-foreground/70 hover:text-foreground",
        active && "border-foreground bg-foreground text-background"
      )}
    >
      {label}
    </button>
  );
}

function JobMetaChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground/70">
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

function jobStatusLabel(status: string | null | undefined) {
  if (!status) {
    return "Now hiring";
  }

  switch (status.toUpperCase()) {
    case "PUBLISHED":
      return "Accepting applications";
    case "PAUSED":
      return "Temporarily paused";
    case "CLOSED":
      return "Role closed";
    default:
      return status;
  }
}
