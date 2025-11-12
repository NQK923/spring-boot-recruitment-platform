import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { deleteCvFormAction } from "@/app/candidate/profile/actions";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";
import { UploadCvForm } from "@/components/profile/upload-cv-form";
import { GenerateCvForm } from "@/components/profile/generate-cv-form";
import { ExperiencesForm } from "@/components/profile/experience-form";
import { EducationForm } from "@/components/profile/education-form";
import { SkillsForm } from "@/components/profile/skills-form";
import { ProjectsForm } from "@/components/profile/projects-form";
import { CertificationsForm } from "@/components/profile/certifications-form";
import { LanguagesForm } from "@/components/profile/languages-form";

async function getProfile(): Promise<Profile | null> {
  try {
    const response = await apiFetch("/api/profiles/me/enriched", { method: "GET" });
    if (response.status === 404) {
      return null;
    }
    const data = await response.json();
    return data && typeof data === "object" ? (data as Profile) : null;
  } catch {
    return null;
  }
}

function formatDate(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("vi-VN", {
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function CandidateProfilePage() {
  const profile =
    (await getProfile()) ?? {
      userId: 0,
      fullName: null,
      avatarUrl: null,
      phoneNumber: null,
      summary: null,
      emailForCv: null,
      location: null,
      website: null,
      linkedin: null,
      github: null,
      portfolio: null,
      yearsOfExperience: null,
      desiredPosition: null,
      workAuthorization: null,
      openToRelocate: false,
      preferredCvLanguage: "vi",
      experiences: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      cvs: [],
    };

  const experiences = profile.experiences
    .slice()
    .sort((a, b) => {
      const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bTime - aTime;
    });

  const education = profile.education
    .slice()
    .sort((a, b) => {
      const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bTime - aTime;
    });

  const skills = profile.skills
    .slice()
    .sort((a, b) => {
      const nameA = (a.skillName || "").toLowerCase();
      const nameB = (b.skillName || "").toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

  const cvs = profile.cvs
    .slice()
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6">
        <header className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Hồ sơ ứng viên
                </p>
                <h1 className="text-3xl font-bold text-gray-900">Cập nhật dữ liệu hồ sơ chuẩn ATS</h1>
              </div>
            </div>
            <p className="text-base text-gray-700 leading-relaxed">
              Điền đầy đủ thông tin, đường dẫn và thành tựu để có thể tạo CV chuẩn ATS,
              đồng thời giúp nhà tuyển dụng hiểu rõ bối cảnh của bạn ngay từ vòng sàng lọc.
            </p>
          </div>
        </header>

      <section className="space-y-6 rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Thông tin chung</h2>
              <p className="text-sm text-gray-600">
                Hãy sử dụng email chuyên nghiệp, cập nhật vị trí mong muốn và các đường dẫn quan trọng.
              </p>
            </div>
          </div>
          <AvatarUploader avatarUrl={profile.avatarUrl} fullName={profile.fullName} />
        </div>
        <UpdateProfileForm
          fullName={profile.fullName}
          phoneNumber={profile.phoneNumber}
          summary={profile.summary}
          emailForCv={profile.emailForCv}
          location={profile.location}
          website={profile.website}
          linkedin={profile.linkedin}
          github={profile.github}
          portfolio={profile.portfolio}
          yearsOfExperience={profile.yearsOfExperience}
          desiredPosition={profile.desiredPosition}
          workAuthorization={profile.workAuthorization}
          openToRelocate={profile.openToRelocate}
          preferredCvLanguage={profile.preferredCvLanguage}
        />
      </section>

      <section id="cvs" className="space-y-6 rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Thư viện CV</h2>
            <p className="text-sm text-gray-600">
              Tải lên bản CV đã hoàn thiện hoặc tạo bản nháp để chỉnh sửa sau. Đặt tên gợi nhớ để
              ghép nhanh cho từng vị trí.
            </p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <UploadCvForm />
          <GenerateCvForm />
        </div>
        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-900">Các phiên bản hiện có</h3>
          {cvs.length === 0 ? (
            <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 px-6 py-5 text-sm text-blue-700">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Chưa có CV nào. Hãy tải lên hoặc tạo bản nháp đầu tiên để sẵn sàng ứng tuyển.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              {cvs.map((cv) => {
                const downloadHref = cv.downloadUrl ?? (cv.fileId ? `/api/files/${cv.fileId}` : null);
                return (
                  <div
                    key={cv.id}
                    className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-blue-50/30 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{cv.versionName}</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(cv.createdAt, "Chưa rõ thời gian")} {cv.isDefault ? "(mặc định)" : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {downloadHref ? (
                        <a
                          href={downloadHref}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Tải xuống
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Bản nháp – cần tải file sau khi hoàn thiện.
                        </span>
                      )}
                      <form action={deleteCvFormAction}>
                        <input type="hidden" name="cvId" value={cv.id} />
                        <button
                          type="submit"
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Xoá
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Kinh nghiệm nổi bật</h2>
            <p className="text-sm text-gray-600">
              Viết thành tựu dạng bullet với số liệu (%, ₫, thời gian) để ATS và Gemini hiểu rõ đóng góp của bạn.
            </p>
          </div>
        </div>
        <ExperiencesForm experiences={experiences} />
      </section>

      <section className="space-y-6 rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Dự án tiêu biểu</h2>
            <p className="text-sm text-gray-600">
              Nêu rõ vai trò, phạm vi và kết quả đo bằng dữ liệu. Thêm đường dẫn demo/repo nếu có.
            </p>
          </div>
        </div>
        <ProjectsForm projects={profile.projects} />
      </section>

      <section className="space-y-6 rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Học vấn & chứng chỉ</h2>
            <p className="text-sm text-gray-600">
              Điền GPA, danh hiệu, học bổng và chứng chỉ để thuyết phục ATS ở phần nền tảng học thuật.
            </p>
          </div>
        </div>
        <EducationForm education={education} />
        <div className="border-t border-dashed border-primary-100 pt-6">
          <CertificationsForm certifications={profile.certifications} />
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Kỹ năng & ngoại ngữ</h2>
            <p className="text-sm text-gray-600">
              Gắn trình độ cho từng kỹ năng và nêu rõ số năm. Đối với ngoại ngữ, chọn thang CEFR/Fluent/Native.
            </p>
          </div>
        </div>
        <SkillsForm skills={skills} />
        <div className="border-t border-dashed border-primary-100 pt-6">
          <LanguagesForm languages={profile.languages} />
        </div>
      </section>
    </div>
  </div>
  );
}
