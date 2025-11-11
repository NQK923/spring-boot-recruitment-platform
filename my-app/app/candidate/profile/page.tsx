import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { deleteCvAction } from "@/app/candidate/profile/actions";
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="space-y-3 text-gray-900">
        <p className="text-sm font-bold uppercase tracking-wide text-primary-700">
          Hồ sơ ứng viên
        </p>
        <h1 className="text-4xl font-bold">Cập nhật dữ liệu hồ sơ chuẩn ATS</h1>
        <p className="text-base text-gray-700 leading-relaxed">
          Điền đầy đủ thông tin, đường dẫn và thành tựu để có thể tạo CV chuẩn ATS,
          đồng thời giúp nhà tuyển dụng hiểu rõ bối cảnh của bạn ngay từ vòng sàng lọc.
        </p>
      </header>

      <section className="space-y-6 rounded-2xl border border-primary-200 bg-white/90 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Thông tin chung</h2>
            <p className="text-sm text-gray-600">
              Hãy sử dụng email chuyên nghiệp, cập nhật vị trí mong muốn và các đường dẫn quan trọng.
            </p>
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

      <section id="cvs" className="space-y-6 rounded-2xl border border-primary-200 bg-white/90 p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-gray-900">Thư viện CV</h2>
          <p className="text-sm text-gray-600">
            Tải lên bản CV đã hoàn thiện hoặc tạo bản nháp để chỉnh sửa sau. Đặt tên gợi nhớ để
            ghép nhanh cho từng vị trí.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <UploadCvForm />
          <GenerateCvForm />
        </div>
        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-900">Các phiên bản hiện có</h3>
          {cvs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-primary-300 bg-primary-50/40 px-4 py-4 text-sm text-gray-700 text-center">
              Chưa có CV nào. Hãy tải lên hoặc tạo bản nháp đầu tiên để sẵn sàng ứng tuyển.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {cvs.map((cv) => {
                const downloadHref = cv.downloadUrl ?? (cv.fileId ? `/api/files/${cv.fileId}` : null);
                return (
                  <div
                    key={cv.id}
                    className="flex flex-col gap-3 rounded-xl border border-primary-100 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{cv.versionName}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(cv.createdAt, "Chưa rõ thời gian")} {cv.isDefault ? "(mặc định)" : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {downloadHref ? (
                        <a
                          href={downloadHref}
                          className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Tải xuống
                        </a>
                      ) : (
                        <span className="text-sm text-gray-600">
                          Bản nháp – cần tải file sau khi hoàn thiện.
                        </span>
                      )}
                      <form action={deleteCvAction}>
                        <input type="hidden" name="cvId" value={cv.id} />
                        <button
                          type="submit"
                          className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                        >
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

      <section className="space-y-6 rounded-2xl border border-primary-200 bg-white/90 p-8 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kinh nghiệm nổi bật</h2>
          <p className="text-sm text-gray-600">
            Viết thành tựu dạng bullet với số liệu (%, ₫, thời gian) để ATS và Gemini hiểu rõ đóng góp của bạn.
          </p>
        </div>
        <ExperiencesForm experiences={experiences} />
      </section>

      <section className="space-y-6 rounded-2xl border border-primary-200 bg-white/90 p-8 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dự án tiêu biểu</h2>
          <p className="text-sm text-gray-600">
            Nêu rõ vai trò, phạm vi và kết quả đo bằng dữ liệu. Thêm đường dẫn demo/repo nếu có.
          </p>
        </div>
        <ProjectsForm projects={profile.projects} />
      </section>

      <section className="space-y-6 rounded-2xl border border-primary-200 bg-white/90 p-8 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Học vấn & chứng chỉ</h2>
          <p className="text-sm text-gray-600">
            Điền GPA, danh hiệu, học bổng và chứng chỉ để thuyết phục ATS ở phần nền tảng học thuật.
          </p>
        </div>
        <EducationForm education={education} />
        <div className="border-t border-dashed border-primary-100 pt-6">
          <CertificationsForm certifications={profile.certifications} />
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-primary-200 bg-white/90 p-8 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kỹ năng & ngoại ngữ</h2>
          <p className="text-sm text-gray-600">
            Gắn trình độ cho từng kỹ năng và nêu rõ số năm. Đối với ngoại ngữ, chọn thang CEFR/Fluent/Native.
          </p>
        </div>
        <SkillsForm skills={skills} />
        <div className="border-t border-dashed border-primary-100 pt-6">
          <LanguagesForm languages={profile.languages} />
        </div>
      </section>
    </div>
  );
}
