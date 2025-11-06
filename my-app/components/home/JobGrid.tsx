import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { ROUTES } from "@/lib/routes";
import type { JobPostingPublic } from "@/lib/types";

type JobWithExtras = JobPostingPublic & {
  companyName?: string | null;
  company?: { name?: string | null } | null;
};

type JobGridProps = {
  jobs: JobPostingPublic[];
};

export function JobGrid({ jobs }: JobGridProps) {
  if (!jobs.length) {
    return (
      <section aria-labelledby="home-jobs" className="relative overflow-hidden bg-gradient-to-br from-bg via-primary-50/40 to-accent-500/20 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%)]" />
        <Container className="space-y-8">
          <Header />
          <Panel className="text-center text-muted">
            Chưa có việc làm mới tại thời điểm này. Hãy quay lại sau hoặc đăng ký nhận thông báo tuyển dụng.
          </Panel>
        </Container>
      </section>
    );
  }

  return (
    <section aria-labelledby="home-jobs" className="relative overflow-hidden bg-gradient-to-br from-bg via-primary-50/40 to-accent-500/20 py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.22),_transparent_55%)]" />
      <Container className="space-y-8">
        <Header />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {(jobs as JobWithExtras[]).map((job) => (
            <article
              key={job.id}
              className="flex h-full flex-col justify-between rounded-2xl border border-border bg-gradient-to-br from-primary-600/10 via-surface to-accent-500/10 p-6 shadow-lg transition hover:border-primary-600 hover:shadow-xl dark:from-surface/25 dark:via-surface/15 dark:to-accent-500/20"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-text">
                  <Link href={`/jobs/${job.id}`} className="hover:text-primary-600">
                    {job.title}
                  </Link>
                </h3>
                <p className="text-sm text-muted">
                  {getCompanyName(job)} • {job.location ?? "Linh hoạt"}
                </p>
                <p className="text-sm text-muted">{getJobSummary(job)}</p>
              </div>

              <div className="mt-6 space-y-3 text-sm text-muted">
                <p>{job.workType ?? "Hình thức linh hoạt"}</p>
                {job.salaryRange ? (
                  <span className="inline-flex w-fit rounded-full bg-primary-600/15 px-3 py-1 text-xs font-semibold text-primary-600">
                    {job.salaryRange}
                  </span>
                ) : null}
                <Button
                  asChild
                  variant="ghost"
                  data-analytics-id="job_apply_click"
                  data-section="jobs"
                  data-job-id={job.id}
                  className="px-0 text-left text-primary-600 hover:text-primary-700"
                >
                  <Link href={`/jobs/${job.id}`} aria-label={`Ứng tuyển vị trí ${job.title}`}>
                    Ứng tuyển ngay
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Header() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted">
          Việc làm mới nhất
        </p>
        <h2 id="home-jobs" className="mt-2 text-3xl font-semibold text-text">
          Cơ hội đang mở chờ bạn ứng tuyển
        </h2>
      </div>
      <Button asChild variant="ghost" className="self-start text-primary-600 hover:text-primary-700">
        <Link href={ROUTES.jobs}>Xem tất cả việc làm</Link>
      </Button>
    </div>
  );
}

function getCompanyName(job: JobWithExtras) {
  return job.companyName ?? job.company?.name ?? "Đang cập nhật";
}

function getJobSummary(job: JobPostingPublic) {
  const source = job.description ?? job.requirements ?? job.benefits ?? "";
  const text = source.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) {
    return "Nhà tuyển dụng sẽ bổ sung mô tả chi tiết trong thời gian sớm nhất.";
  }
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}
