import type { Metadata } from "next";

import { FAQ } from "@/components/home/FAQ";
import { Features } from "@/components/home/Features";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { JobGrid } from "@/components/home/JobGrid";
import { Stats } from "@/components/home/Stats";
import { Testimonials } from "@/components/home/Testimonials";
import { getLatestJobs } from "@/lib/jobs";
import type { JobPostingPublic } from "@/lib/types";

const LATEST_JOBS_LIMIT = 8;
const OG_IMAGE = "/og/home-indigo.png";
const BRAND_NAME = "TalentFlow";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `Tuyển đúng người – Nhanh hơn và minh bạch hơn | ${BRAND_NAME}`,
  description:
    "Nền tảng tuyển dụng hợp nhất cho doanh nghiệp và ứng viên: đăng tin, sàng lọc, phỏng vấn và báo cáo minh bạch trong một nơi duy nhất.",
  alternates: { canonical: "/" },
  openGraph: {
    title: `Tuyển đúng người – Nhanh hơn và minh bạch hơn | ${BRAND_NAME}`,
    description:
      "TalentFlow giúp doanh nghiệp tự động hoá quy trình tuyển dụng, cải thiện trải nghiệm ứng viên và quản trị minh bạch.",
    type: "website",
    locale: "vi_VN",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} - Tuyển đúng người nhanh hơn`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Tuyển đúng người – Nhanh hơn và minh bạch hơn | ${BRAND_NAME}`,
    description:
      "Khám phá nền tảng SaaS tinh gọn để quản lý tuyển dụng minh bạch cho doanh nghiệp và ứng viên.",
    images: [OG_IMAGE],
  },
};

export default async function HomePage() {
  const jobs = await getLatestJobs({ limit: LATEST_JOBS_LIMIT });

  return (
    <main className="flex flex-col bg-white text-slate-900">
      <Hero />
      <Stats />
      <Features />
      <JobGrid jobs={jobs} />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
      <FAQ />
      <StructuredData jobs={jobs} />
    </main>
  );
}

function StructuredData({ jobs }: { jobs: JobPostingPublic[] }) {
  const jobPostings = jobs.map((job) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: toPlainText(job.description ?? job.requirements ?? job.benefits ?? ""),
    hiringOrganization: {
      "@type": "Organization",
      name: BRAND_NAME,
      sameAs: "https://talentflow.app",
    },
    totalJobOpenings: job.availableSlots ?? job.hiringQuantity ?? 1,
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
    identifier: {
      "@type": "PropertyValue",
      name: BRAND_NAME,
      value: String(job.id),
    },
  }));

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: "https://talentflow.app",
    logo: "https://talentflow.app/logo.png",
    sameAs: ["https://www.facebook.com/talentflow", "https://www.linkedin.com/company/talentflow"],
  };

  const payload = JSON.stringify([organizationSchema, ...jobPostings]);

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: payload }} />
  );
}

function toPlainText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
