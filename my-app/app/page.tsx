import type { Metadata } from "next";

import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { JobGrid } from "@/components/home/JobGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Stats } from "@/components/home/Stats";
import { TrustedBy } from "@/components/home/TrustedBy";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalCTA } from "@/components/home/FinalCTA";
import { FAQ } from "@/components/home/FAQ";
import { apiFetch } from "@/lib/api";
import type { JobPostingPublic, PaginatedResponse } from "@/lib/types";

const LATEST_JOBS_LIMIT = 8;

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tuyển đúng người – Nhanh hơn và minh bạch hơn | Talentflow",
  description:
    "Nền tảng tuyển dụng hợp nhất cho doanh nghiệp và ứng viên: đăng tin, sàng lọc, phỏng vấn, báo cáo và theo dõi trong một nơi duy nhất.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tuyển đúng người – Nhanh hơn và minh bạch hơn | Talentflow",
    description:
      "Talentflow giúp doanh nghiệp tự động hoá pipeline tuyển dụng, cộng tác đa vai trò và đem lại trải nghiệm minh bạch cho ứng viên.",
    type: "website",
    locale: "vi_VN",
    url: "https://talentflow.app/",
    images: [
      {
        url: "https://talentflow.app/og/home-green-teal.png",
        width: 1200,
        height: 630,
        alt: "Talentflow - Tuyển đúng người nhanh hơn và minh bạch hơn",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Talentflow | Tuyển đúng người – Nhanh hơn và minh bạch hơn",
    description:
      "Khám phá việc làm phù hợp hoặc quản lý tuyển dụng đa vai trò trong một nền tảng duy nhất dành cho doanh nghiệp Việt Nam.",
    images: ["https://talentflow.app/og/home-green-teal.png"],
  },
};

export default async function HomePage() {
  const jobs = await getLatestJobs();

  return (
    <main className="flex flex-col bg-bg text-text">
      <Hero />
      <div className="py-12">
        <Features />
      </div>
      <div className="py-12" style={{ background: 'linear-gradient(180deg, #FAFBFC 0%, #F9FAFB 50%, #FAFBFC 100%)' }}>
        <JobGrid jobs={jobs} />
      </div>
      <div className="py-12">
        <HowItWorks />
      </div>
      <div className="py-12" style={{ background: 'linear-gradient(180deg, #FAFBFC 0%, #F9FAFB 50%, #FAFBFC 100%)' }}>
        <Stats />
      </div>
      <div className="py-12">
        <TrustedBy />
      </div>
      <div className="py-12" style={{ background: 'linear-gradient(180deg, #FAFBFC 0%, #F9FAFB 50%, #FAFBFC 100%)' }}>
        <Testimonials />
      </div>
      <FinalCTA />
      <div className="py-12">
        <FAQ />
      </div>
      <StructuredData jobs={jobs} />
    </main>
  );
}

async function getLatestJobs(): Promise<JobPostingPublic[]> {
  try {
    const params = new URLSearchParams({
      page: "0",
      size: String(LATEST_JOBS_LIMIT),
    });

    const response = await apiFetch(`/api/jobs/public?${params.toString()}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "no-store",
    });

    const data = (await response.json()) as PaginatedResponse<JobPostingPublic>;
    return (data.items ?? []).slice(0, LATEST_JOBS_LIMIT);
  } catch {
    return [];
  }
}

function StructuredData({ jobs }: { jobs: JobPostingPublic[] }) {
  if (!jobs.length) {
    return null;
  }

  const payload = jobs.map((job) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: toPlainText(job.description ?? job.requirements ?? job.benefits ?? ""),
    hiringOrganization: {
      "@type": "Organization",
      name: "Doanh nghiệp trên Talentflow",
      sameAs: "https://talentflow.app/",
    },
    employmentType: job.workType ?? "FULL_TIME",
    jobLocation: job.location
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.location,
            addressCountry: "VN",
          },
        }
      : undefined,
    directApply: true,
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

function toPlainText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
