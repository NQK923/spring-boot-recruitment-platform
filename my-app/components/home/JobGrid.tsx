import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/routes";
import type { JobPostingPublic } from "@/lib/types";

type JobGridProps = {
  jobs: JobPostingPublic[];
};

type JobWithExtras = JobPostingPublic & {
  companyName?: string | null;
  company?: { name?: string | null } | null;
};

export function JobGrid({ jobs }: JobGridProps) {
  return (
    <section aria-labelledby="home-jobs" className="bg-bg">
      <Container className="space-y-8 py-20">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted">Việc làm mới nhất</p>
            <h2 id="home-jobs" className="mt-2 text-3xl font-bold text-text">
              Cơ hội sẵn sàng dành cho bạn
            </h2>
          </div>
          <Button asChild variant="ghost" className="self-start">
            <Link href={ROUTES.jobs} aria-label="Xem tất cả việc làm đang tuyển">
              Xem tất cả việc làm
            </Link>
          </Button>
        </header>

        {jobs.length === 0 ? (
          <Card className="text-center text-muted">
            Chưa có việc làm mới trong thời gian này. Hãy quay lại sau hoặc tạo thông báo việc làm để được cập nhật sớm nhất.
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-primary-50/30 dark:hover:bg-white/5"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-text group-hover:text-primary-600">
                    <Link href={`/jobs/${job.id}`} aria-label={`Xem chi tiết việc làm ${job.title}`}>
                      {job.title}
                    </Link>
                  </h3>
                  <p className="text-sm font-medium text-muted">
                    {getCompanyName(job)} · {job.location ?? "Linh hoạt"}
                  </p>
                  {job.salaryRange ? (
                    <span className="inline-flex items-center rounded-full bg-success-600/10 px-3 py-1 text-xs font-semibold text-success-600">
                      {job.salaryRange}
                    </span>
                  ) : null}
                  <p className="line-clamp-3 text-sm text-muted">{getJobSummary(job)}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm text-muted">
                  <span>{job.workType ?? "Làm việc linh hoạt"}</span>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    data-analytics-id="job_apply_click"
                    data-section="jobs"
                    data-job-id={job.id}
                  >
                    <Link href={`/jobs/${job.id}`} aria-label={`Ứng tuyển vào vị trí ${job.title}`}>
                      Ứng tuyển
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function getCompanyName(job: JobPostingPublic) {
  const item = job as JobWithExtras;
  return item.companyName ?? item.company?.name ?? "Tên công ty đang cập nhật";
}

function getJobSummary(job: JobPostingPublic) {
  const source = job.description ?? job.requirements ?? job.benefits ?? "";
  const text = source.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) {
    return "Nhà tuyển dụng sẽ cập nhật mô tả chi tiết trong thời gian sớm nhất.";
  }
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}
