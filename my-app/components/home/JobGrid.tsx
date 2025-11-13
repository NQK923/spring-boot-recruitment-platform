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

const BADGES = ["Product", "Hybrid", "Mid-level", "Growth team"] as const;

export function JobGrid({ jobs }: JobGridProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-20 left-20 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300 to-indigo-300 opacity-20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 right-20 h-80 w-80 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 opacity-15 blur-3xl"
      />
      <Container className="relative space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-1.5 text-xs text-amber-700 font-bold">
              ⭐ Tin tuyển dụng mới nhất
            </div>
            <h2 id="home-jobs" className="text-3xl md:text-4xl font-bold text-slate-900">
              Việc làm nổi bật
            </h2>
            <p className="text-base text-slate-600">
              Cập nhật trực tiếp từ các doanh nghiệp đang tuyển dụng
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-full border-2 border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                {badge}
              </span>
            ))}
            <Button asChild variant="ghost" className="px-3 py-1 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Link href={ROUTES.jobs} aria-label="Xem tất cả việc làm đang tuyển">
                Xem tất cả →
              </Link>
            </Button>
          </div>
        </header>

        {jobs.length === 0 ? (
          <Card className="text-center text-slate-600 bg-white py-12">
            Chưa có việc làm mới. Hãy quay lại sau!
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {jobs.map((job) => (
              <Card
                key={job.id}
                as="article"
                className="group h-full bg-white border-2 border-blue-100 hover:border-blue-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">{job.workType ?? "Linh hoạt"}</span>
                    <span className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-0.5 text-xs text-white font-bold">
                      Mở
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                    <Link href={`/jobs/${job.id}`} aria-label={`Xem chi tiết việc làm ${job.title}`}>
                      {job.title}
                    </Link>
                  </h3>
                  <p className="text-sm font-semibold text-slate-700">
                    {getCompanyName(job)} · {job.location ?? "Linh hoạt"}
                  </p>
                  {job.salaryRange ? (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                      💰 {job.salaryRange}
                    </span>
                  ) : null}
                  <p className="text-sm text-slate-600 line-clamp-2">{getJobSummary(job)}</p>
                </div>
              </Card>
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
