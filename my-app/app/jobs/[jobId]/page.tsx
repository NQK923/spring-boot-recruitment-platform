import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getAccessTokenFromCookies } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import { ApplyForm } from "@/components/jobs/apply-form";
import type { CompanyPublicProfile, JobPostingPublic, MeResponse } from "@/lib/types";

async function getJob(jobId: string): Promise<JobPostingPublic | null> {
  try {
    const response = await apiFetch(`/api/jobs/public/${jobId}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "no-store",
    });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return (data && typeof data === "object") ? (data as JobPostingPublic) : null;
  } catch {
    return null;
  }
}

async function getCurrentUser(): Promise<MeResponse | null> {
  try {
    const response = await apiFetch("/api/auth/me", { method: "GET" });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data as MeResponse;
  } catch {
    return null;
  }
}

async function getCompanyProfile(companyId: number): Promise<CompanyPublicProfile | null> {
  try {
    const response = await apiFetch(`/api/companies/public/${companyId}`, {
      method: "GET",
      skipAuthHeaders: true,
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data as CompanyPublicProfile;
  } catch {
    return null;
  }
}

type JobDetailsPageProps = {
  params: Promise<{ jobId: string }> | { jobId: string };
};

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const job = await getJob(resolvedParams.jobId);
  if (!job) {
    notFound();
  }
  const totalSlots = Math.max(job.hiringQuantity ?? 1, 1);
  const remainingSlots = Math.max(Math.min(job.availableSlots ?? totalSlots, totalSlots), 0);
  const hiredCount = Math.max(totalSlots - remainingSlots, 0);
  const hiringStatusText =
    remainingSlots > 0
      ? `CÃ²n ${remainingSlots} vá»‹ trÃ­ trá»‘ng`
      : "ÄÃ£ tuyá»ƒn Ä‘á»§ sá»‘ lÆ°á»£ng â€“ váº«n tiáº¿p nháº­n há»“ sÆ¡ dá»± phÃ²ng";
  const companyProfile = job.companyId ? await getCompanyProfile(job.companyId) : null;

  let canApply = false;
  const token = await getAccessTokenFromCookies();
  if (token) {
    const me = await getCurrentUser();
    canApply = me?.roles?.includes("CANDIDATE") ?? false;
  }

  const companyWebsiteRaw = companyProfile?.website ?? null;
  const companyWebsite =
    companyWebsiteRaw && companyWebsiteRaw.trim().length > 0
      ? companyWebsiteRaw.startsWith("http")
        ? companyWebsiteRaw
        : `https://${companyWebsiteRaw}`
      : null;

  return (
    <Container className="max-w-5xl space-y-8 py-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-indigo-600">
          <span className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1 text-emerald-700">ÄÄƒng tuyá»ƒn cÃ´ng khai</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">{job.title}</h1>
        <p className="max-w-3xl text-base leading-relaxed text-slate-600 font-medium">
          ThÃ´ng tin chi tiáº¿t Ä‘Æ°á»£c cung cáº¥p trá»±c tiáº¿p tá»« Ä‘á»™i ngÅ© tuyá»ƒn dá»¥ng. HÃ£y á»©ng tuyá»ƒn Ä‘á»ƒ tham gia pipeline, hoáº·c Ä‘Äƒng nháº­p vÃ o workspace á»©ng viÃªn Ä‘á»ƒ theo dÃµi phá»ng váº¥n vÃ  pháº£n há»“i.
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            ðŸ‘¥ {totalSlots} vá»‹ trÃ­ cáº§n tuyá»ƒn
          </span>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
              remainingSlots > 0
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {remainingSlots > 0 ? "âš¡" : "â„¹ï¸"} {hiringStatusText}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel padding="lg" className="space-y-6 border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <span>ðŸ“‹</span>
                <span>Tá»•ng quan vá»‹ trÃ­</span>
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">
                {job.description ??
                  "Äá»™i ngÅ© tuyá»ƒn dá»¥ng Ä‘ang hoÃ n thiá»‡n mÃ´ táº£. HÃ£y quay láº¡i sau hoáº·c theo dÃµi vá»‹ trÃ­ Ä‘á»ƒ nháº­n cáº­p nháº­t."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <span>âœ…</span>
                <span>YÃªu cáº§u</span>
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">
                {job.requirements ??
                  "NhÃ  tuyá»ƒn dá»¥ng sáº½ bá»• sung ká»¹ nÄƒng, kinh nghiá»‡m vÃ  cÃ´ng cá»¥ báº¯t buá»™c ngay khi Ä‘Æ°á»£c xÃ¡c nháº­n."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <span>ðŸŽ</span>
                <span>Quyá»n lá»£i</span>
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">
                {job.benefits ??
                  "ThÃ´ng tin quyá»n lá»£i vÃ  Ä‘Ã£i ngá»™ sáº½ Ä‘Æ°á»£c cáº­p nháº­t khi bÃ i Ä‘Äƒng hoÃ n táº¥t."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <span>ðŸ’°</span>
                <span>Khung lÆ°Æ¡ng</span>
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">
                {job.salaryRange ??
                  "ThÃ´ng tin lÆ°Æ¡ng sáº½ hiá»ƒn thá»‹ sau khi Ä‘á»™i ngÅ© tuyá»ƒn dá»¥ng xÃ¡c Ä‘á»‹nh má»©c cá»¥ thá»ƒ cho vá»‹ trÃ­ nÃ y."}
              </p>
            </div>
          </Panel>

          <Panel padding="lg" className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <div className="space-y-3">
              <p className="text-base font-bold text-purple-900 flex items-center gap-2">
                <span>ðŸ”„</span>
                <span>Quy trÃ¬nh tuyá»ƒn dá»¥ng cá»§a Ä‘á»™i ngÅ© nÃ y</span>
              </p>
              <p className="text-sm leading-relaxed text-slate-700 font-medium">
                Há»“ sÆ¡ sáº½ Ä‘Æ°á»£c chuyá»ƒn tháº³ng tá»›i nhÃ  tuyá»ƒn dá»¥ng phá»¥ trÃ¡ch. Báº¡n sáº½ nháº­n cáº­p nháº­t ká»‹p thá»i, ghi chÃº ná»™i bá»™ vÃ  lá»i má»i phá»ng váº¥n trong suá»‘t quÃ¡ trÃ¬nh.
              </p>
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel padding="lg" className="space-y-5 border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">ðŸ¢ Vá» cÃ´ng ty</p>
              <h2 className="text-2xl font-bold text-slate-900">
                {companyProfile?.name ?? "ÄÆ¡n vá»‹ tuyá»ƒn dá»¥ng"}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 font-medium">
              {companyProfile?.description ??
                "Äá»™i ngÅ© tuyá»ƒn dá»¥ng sáº½ chia sáº» thÃªm vá» vÄƒn hÃ³a, giÃ¡ trá»‹ vÃ  sá»© má»‡nh cá»§a cÃ´ng ty khi bÃ i Ä‘Äƒng Ä‘Æ°á»£c cáº­p nháº­t."}
            </p>
            <dl className="space-y-4 text-sm">
              <div className="space-y-1">
                <dt className="font-bold text-indigo-900">ðŸ‘¥ Quy mÃ´ nhÃ¢n sá»±</dt>
                <dd className="text-slate-700 font-medium">{companyProfile?.companySize ?? "Äang chá» nhÃ  tuyá»ƒn dá»¥ng xÃ¡c nháº­n sá»‘ lÆ°á»£ng nhÃ¢n sá»±."}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-bold text-indigo-900">ðŸ“ VÄƒn phÃ²ng chÃ­nh</dt>
                <dd className="text-slate-700 font-medium">{companyProfile?.companyAddress ?? "Äá»‹a chá»‰ vÄƒn phÃ²ng sáº½ Ä‘Æ°á»£c cÃ´ng bá»‘ sá»›m."}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-bold text-indigo-900">ðŸŒ NÆ¡i lÃ m viá»‡c</dt>
                <dd className="text-slate-700 font-medium">{job.location ?? "ThÃ´ng tin Ä‘á»‹a Ä‘iá»ƒm sáº½ hiá»ƒn thá»‹ sau khi xÃ¡c nháº­n."}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-bold text-indigo-900">ðŸ’¼ HÃ¬nh thá»©c lÃ m viá»‡c</dt>
                <dd className="text-slate-700 font-medium">{job.workType ?? "Äá»™i ngÅ© sáº½ sá»›m xÃ¡c nháº­n ká»³ vá»ng onsite, hybrid hoáº·c remote."}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-bold text-indigo-900">👥 Số lượng tuyển</dt>
                <dd className="text-slate-700 font-medium">
                  {totalSlots} vị trí · {hiringStatusText}
                  {hiredCount > 0 && (
                    <span className="block text-xs font-semibold text-slate-500">
                      Đã có {hiredCount} ứng viên nhận offer.
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            {companyWebsite && (
              <Link
                href={companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-2.5 text-sm font-bold text-indigo-700 transition hover:border-indigo-400 hover:shadow-md"
              >
                Truy cáº­p trang cÃ´ng ty â†’
              </Link>
            )}
          </Panel>
        </aside>
      </div>

      {canApply ? (
        <Panel padding="lg" className="border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
                <span>ðŸ“</span>
                <span>Gá»­i há»“ sÆ¡ á»©ng tuyá»ƒn</span>
              </h2>
              <p className="text-sm text-slate-700 font-medium">
                HÃ£y gá»­i há»“ sÆ¡ kÃ¨m CV má»›i nháº¥t. Báº¡n cÃ³ thá»ƒ quáº£n lÃ½ tÃ i liá»‡u vÃ  theo dÃµi tráº¡ng thÃ¡i ngay trong portal á»©ng viÃªn.
              </p>
              {remainingSlots <= 0 && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                  Đội ngũ đã tuyển đủ số lượng chính thức nhưng vẫn tiếp nhận hồ sơ dự phòng cho các đợt mở rộng tiếp theo.
                </p>
              )}
            </div>
            <ApplyForm jobPostingId={job.id} />
          </div>
        </Panel>
      ) : (
        <Panel padding="lg" className="border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xl font-bold text-amber-900 flex items-center gap-2">
                <span>ðŸš€</span>
                <span>Sáºµn sÃ ng á»©ng tuyá»ƒn?</span>
              </p>
              <p className="text-sm text-slate-700 font-medium">
                ÄÄƒng nháº­p báº±ng tÃ i khoáº£n á»©ng viÃªn Ä‘á»ƒ ná»™p há»“ sÆ¡ vÃ  theo dÃµi cÃ¡c giai Ä‘oáº¡n trong portal chuyÃªn biá»‡t.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`${ROUTES.signIn}?next=${ROUTES.jobs}/${job.id}`}>
                <Button size="md">ÄÄƒng nháº­p Ä‘á»ƒ á»©ng tuyá»ƒn</Button>
              </Link>
              <Link href={ROUTES.register}>
                <Button size="md" variant="secondary">
                  Táº¡o tÃ i khoáº£n á»©ng viÃªn
                </Button>
              </Link>
            </div>
          </div>
        </Panel>
      )}
    </Container>
  );
}


