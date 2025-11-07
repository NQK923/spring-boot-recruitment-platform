import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";
import { UploadCvForm } from "@/components/profile/upload-cv-form";
import { GenerateCvForm } from "@/components/profile/generate-cv-form";
import { ExperiencesForm } from "@/components/profile/experience-form";
import { EducationForm } from "@/components/profile/education-form";
import { SkillsForm } from "@/components/profile/skills-form";

async function getProfile(): Promise<Profile | null> {
  try {
    const response = await apiFetch("/api/profiles/me", { method: "GET" });
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
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
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
      experiences: [],
      education: [],
      skills: [],
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Ứng viên</p>
        <h1 className="text-4xl font-bold text-gray-900">Cài đặt hồ sơ</h1>
        <p className="text-base text-gray-700 leading-relaxed">
          Thông tin được lưu ở đây sẽ hiển thị trên bảng điều khiển của nhà tuyển dụng, thẻ ứng tuyển và tóm tắt phỏng vấn.
        </p>
      </header>

      <section className="space-y-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border-2 border-primary-200 p-8 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
          <p className="text-sm text-gray-700 mt-1">
            Cập nhật các thuộc tính hồ sơ cơ bản của bạn. Những giá trị này sẽ hiển thị cho nhà tuyển dụng.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <AvatarUploader avatarUrl={profile.avatarUrl} fullName={profile.fullName} />
          <p className="text-sm text-gray-700 md:max-w-sm">
            Ảnh này xuất hiện trên bảng điều khiển ứng viên và bất kỳ thẻ ứng tuyển nào dành cho nhà tuyển dụng.
          </p>
        </div>
        <UpdateProfileForm
          fullName={profile.fullName}
          phoneNumber={profile.phoneNumber}
          summary={profile.summary}
        />
      </section>

      <section className="space-y-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border-2 border-primary-200 p-8 shadow-lg">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-gray-900">Quản lý CV</h2>
          <p className="text-sm text-gray-700">
            Tải lên CV đã được chỉnh sửa hoặc tạo mẫu tạm thời để điều chỉnh các bản gửi cho từng vai trò.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <UploadCvForm />
          <GenerateCvForm />
        </div>
        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-900">Các phiên bản hiện có</h3>
          {cvs.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-primary-300 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 px-4 py-4 text-sm text-gray-700 text-center">
              Chưa có CV nào được tải lên. Thêm một CV ở trên để đính kèm vào các ứng tuyển trong tương lai.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {cvs.map((cv) => {
                  const downloadHref =
                    cv.downloadUrl ?? (cv.fileId ? `/api/files/${cv.fileId}` : null);

                return (
                  <div
                    key={cv.id}
                    className="flex flex-col gap-2 rounded-xl border-2 border-primary-200 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{cv.versionName}</p>
                      <p className="text-sm text-gray-700">
                        Đã thêm {formatDate(cv.createdAt, "Ngày không xác định")} {cv.isDefault ? "(mặc định)" : ""}
                      </p>
                    </div>
                    {downloadHref ? (
                      <a
                        href={downloadHref}
                        className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Tải xuống
                      </a>
                    ) : (
                      <span className="text-sm text-gray-700">
                        Mẫu tạm - tải lên phiên bản cập nhật khi sẵn sàng.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border-2 border-primary-200 p-8 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kinh nghiệm</h2>
          <p className="text-sm text-gray-700 mt-1">
            Ghi lại các vai trò đã định hình hành trình của bạn. Thêm mục mới hoặc cập nhật các mục hiện có bất cứ khi nào câu chuyện của bạn phát triển.
          </p>
        </div>
        <ExperiencesForm experiences={experiences} />
      </section>

      <section className="space-y-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border-2 border-primary-200 p-8 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Học vấn</h2>
          <p className="text-sm text-gray-700 mt-1">
            Giữ cho nền tảng học thuật của bạn được cập nhật để nhà tuyển dụng hiểu được nền tảng và chuyên môn của bạn.
          </p>
        </div>
        <EducationForm education={education} />
      </section>

      <section className="space-y-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border-2 border-primary-200 p-8 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kỹ năng</h2>
          <p className="text-sm text-gray-700 mt-1">
            Làm nổi bật các kỹ năng bạn dựa vào nhiều nhất. Thêm kỹ năng cứng và kỹ năng mềm để giúp nhà tuyển dụng kết nối với bạn nhanh chóng.
          </p>
        </div>
        <SkillsForm skills={skills} />
      </section>
    </div>
  );
}
