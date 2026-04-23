# TalentFlow – Nền tảng tuyển dụng đa dịch vụ


## 1. Tổng quan kiến trúc
- Monorepo gồm 11 microservice Spring Boot (auth, company, job, application, interview, notification, file-storage, chat, user-profile, gateway, discovery) và frontend Next.js 16.
- Mỗi dịch vụ kết nối cùng cụm PostgreSQL Supabase nhưng dùng schema riêng (`auth_db`, `company_db`, `job_db`, …) và quản lý bằng Liquibase.
- RabbitMQ làm tầng messaging; các sự kiện chuẩn hóa (`user.registered`, `application.status.changed`, `interview.scheduled`, …) giúp đồng bộ chức năng và email.
- File nhị phân (CV, avatar) được lưu tại Supabase Storage; file metadata giữ trong Postgres.
- Gateway đứng trước toàn bộ backend: xác thực JWT, làm giàu header (`X-User-ID`, `X-User-Roles`, `X-Company-ID`), định tuyến và CORS.

### Hạ tầng chung
- **Discovery service (Eureka)** chạy ở `backend/discovery-service`, cổng 8761; các dịch vụ đăng ký để phục vụ lookup nội bộ.
- **Gateway** dùng Spring Cloud Gateway với route khai báo thủ công. JWT secret (`app.jwt.secret`) phải đồng bộ với Auth Service và mọi resource server.
- **Supabase** cung cấp PostgreSQL + Storage + pgvector (dùng cho chat-service).
- **RabbitMQ** được Spring Cloud Stream/StreamBridge sử dụng để publish/consume các sự kiện nêu trên.
- **Frontend** (Next.js 16) sử dụng cookies HTTP-only; Gateway bật `allow-credentials: true` và whitelists `http://localhost:3000`.

### Giao kèo header từ Gateway

| Header        | Ý nghĩa                                                        | Được sử dụng bởi                                                |
| ------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `X-User-ID`   | `sub` của JWT, nhận diện user trong mọi service                | application-, job-, company-, interview-service,…                |
| `X-User-Role` | Vai trò đầu tiên trong token (để log/kiểm tra nhanh)           | Các controller recruiter/candidate                              |
| `X-User-Roles`| Danh sách vai trò cách nhau dấu phẩy (tương thích logic cũ)   | Một số service vẫn parse chuỗi này                               |
| `X-Company-ID`| Company của user (claim hoặc tra qua Company Service nội bộ)   | Job/Application/Company/User-profile service yêu cầu header này  |

## 2. Cấu trúc thư mục chính

```
backend/
  auth-service/             // Xác thực, đăng ký, OAuth, quản lý lời mời
  company-service/          // Quản lý tenant, roster và template
  job-service/              // CRUD job + public search
  application-service/      // Pipeline ứng tuyển, ghi chú, nhiệm vụ
  interview-service/        // Lịch phỏng vấn, feedback, ICS
  user-profile-service/     // Hồ sơ ứng viên, CV upload/generate
  file-storage-service/     // Upload/download file qua Supabase Storage
  notification-service/     // Email consumer cho các sự kiện RabbitMQ
  chat-service/             // Chatbot + gợi ý việc làm (Spring AI + Gemini)
  gateway-service/          // Spring Cloud Gateway
  discovery-service/        // Eureka server
my-app/                     // Frontend Next.js 16
docker-compose.yml, k8s/, HOWTOWORK.md, README.md, …
```

## 3. Dịch vụ backend

### API Gateway (`backend/gateway-service`)
- Xác thực JWT bằng `JwtAuthenticationFilter`, bỏ qua các path công khai (`/api/auth/login`, `/api/jobs/public/**`, `/api/chat/**`, …).
- `AddCompanyIdHeaderFilter` bổ sung `X-Company-ID` (từ claim hoặc gọi `/api/internal/companies/users/{userId}/company`), đồng thời đồng bộ lại `X-User-Roles`.
- Route thủ công tới toàn bộ service (`/api/auth/**`, `/api/companies/**`, `/api/jobs/**`, `/api/applications/**`, …). CORS chỉ rõ origin và bật `allowCredentials`.
- Khi thêm route mới cần cập nhật `application.yml` và danh sách path được bỏ qua trong filter.

### Discovery Service (`backend/discovery-service`)
- Eureka server đơn, cấu hình `register-with-eureka=false` và `fetch-registry=false`.
- Dịch vụ khác đăng ký để hỗ trợ lookup/tracing; UI có tại `http://localhost:8761`.
- Chạy trước các service khác để tránh lỗi đăng ký khi khởi động cụm.

### Auth Service (`backend/auth-service`)
- Xử lý đăng ký, xác nhận email, đăng nhập mật khẩu, đăng nhập Google/GitHub, lời mời, quên mật khẩu và `GET /api/auth/me`.
- Controller chính: `AuthController` (login/register/OAuth/verify-email/password reset), `InvitationController`, `InternalAuthController`.
- `JwtTokenProvider` ký HS512 với `app.jwt.secret`, nhúng `roles` và `companyId`. Nếu company-service trả `locked=true`, đăng nhập bị chặn.
- Bảng chính: `users`, `roles`, `user_roles`, `invitations`, `email_verification_tokens`, `password_reset_tokens`.
- Sự kiện: phát `user.invited`, `user.registered` (kèm OTP), `password.reset.requested`. Gọi `CompanyService` để gắn user vào công ty sau khi nhận invite.

### Company Service (`backend/company-service`)
- Quản trị tenant: CRUD công ty, roster (`company_users`), gửi lời mời (qua Auth Service), khóa recruiter và quản lý template liên lạc.
- Endpoint chính: `/api/companies/**`, `/api/companies/me/**`, `/api/companies/templates`, `/api/companies/public/**`, `/api/internal/companies/**`.
- Dashboard tổng hợp dữ liệu từ job-service và application-service; public overview hiển thị metric + job spotlight.
- Sự kiện: `company.user.locked` (chặn recruiter), `company.status.changed` (thông báo cho admin). Nội bộ gateway sử dụng `GET /api/internal/companies/users/{userId}/company` để enrich header.

### Job Service (`backend/job-service`)
- Quản lý job postings, job positions, expose public search `GET /api/jobs/public`, chi tiết `GET /api/jobs/public/{id}`.
- Recruiter endpoints yêu cầu `X-Company-ID`: `POST /api/jobs`, `PUT /api/jobs/{id}`, `GET /api/jobs`, `POST/GET /api/jobs/positions`.
- Internal metrics: `/api/internal/jobs/{jobId}`, `/api/internal/jobs/metrics/**`, `/api/internal/jobs/metrics/company/{companyId}/job-ids`.
- `JobPostingService` tự động đóng job khi slot đầy (dựa trên `ApplicationServiceClient.getHiredCount`) và gọi chat-service reindex khi job PUBLISHED.

### Application Service (`backend/application-service`)
- Điều phối pipeline ứng tuyển: candidate apply (`POST /api/applications`), recruiter xem danh sách job (`/api/applications/jobs/{jobId}/applications`), cập nhật trạng thái (`PATCH /status`), note/task, offer, owner assignment.
- Internal API phục vụ profile-service, job-service và dashboard: `/api/internal/applications/candidates/{candidateId}/companies/{companyId}/exists`, `/api/internal/applications/{id}/summary`, `/api/internal/applications/metrics/**`.
- Giữ snapshot job ngay khi ứng viên nộp để dữ liệu ổn định; enforce pipeline tuyến tính (`APPLIED -> ... -> HIRED`, reject ở bất kỳ bước).
- Phát `application.status.changed` với metadata phỏng vấn/offer cho notification-service.

### Interview Service (`backend/interview-service`)
- Lên lịch, reschedule, thu feedback và cung cấp ICS cá nhân (`/api/interviews/{id}/calendar.ics`, `/api/interviews/my/calendar.ics`).
- `InterviewService` tạo participants, gọi application-service lấy `ApplicationSummaryDto` rồi phát `interview.scheduled` / `interview.rescheduled`.
- Endpoint recruiter/candidate: `POST /api/interviews`, `PUT /api/interviews/{id}`, `GET /api/interviews/my`, `POST /api/interviews/{id}/feedback`.
- Metrics nội bộ `/api/internal/interviews/metrics/summary` dùng cho dashboard + public overview.

### User Profile Service (`backend/user-profile-service`)
- Quản lý profile ứng viên, bảng con (experience/education/skills/...), upload avatar/CV, tạo CV bằng Gemini (Spring AI).
- Candidate endpoints: `/api/profiles/me`, `/me/cvs`, `/me/cvs/upload`, `/me/cvs/generate`.
- Recruiter endpoints yêu cầu `X-Company-ID` + xác thực qua application-service trước khi cho phép xem `/api/profiles/{userId}`.
- Event consumer cho `user.registered` để tạo profile mặc định. Khi tạo CV, `CvGeneratorService` giới hạn 3 request/phút/người, gọi Gemini, render Freemarker → PDF → upload file-storage.

### File Storage Service (`backend/file-storage-service`)
- Cung cấp `POST /api/files/upload`, `POST /api/files/avatar`, `GET /api/files/{id}` và `/api/files/internal/avatars/sync`.
- Lưu metadata vào `file_metadata`, nội dung vào Supabase Storage (bucket private cho CV, public cho avatar).
- Kiểm tra quyền truy cập dựa trên uploaderId hoặc vai trò recruiter/admin; endpoint nội bộ sync avatar phục vụ social login.

### Notification Service (`backend/notification-service`)
- Spring Cloud Function consumer, không expose REST. Lắng nghe 8 sự kiện chính và gửi email bằng `JavaMailSender`.
- Tự động gọi `AuthServiceClient` (qua gateway) để đổi userIds → email khi payload thiếu email.
- Email template tiếng Việt, nhấn mạnh timeline phỏng vấn, OTP, trạng thái ứng tuyển, cảnh báo khóa recruiter, thay đổi trạng thái công ty.

### Chat Service (`backend/chat-service`)
- Chatbot tư vấn tuyển dụng và gợi ý việc làm; cung cấp REST (`POST /api/chat/message`) và SSE (`GET /api/chat/stream`).
- Sử dụng Spring AI với custom `GeminiClient` + embedding (Supabase pgvector). `IntentGuard` chặn câu hỏi ngoài phạm vi, `UserRateLimiter` giới hạn 10 yêu cầu/phút.
- Recommendation pipeline kết hợp embedding profile/job và hàm score `0.50*(1-dq)+0.35*(1-dp)+0.15*exp(-days/freshnessDays)`, kết quả 3–5 job tiếng Việt.
- Admin có thể reindex job/profile (`/api/chat/reindex/job/{id}`, `/profile/{userId}`) – yêu cầu vai trò `SUPER_ADMIN` hoặc `COMPANY_ADMIN`.

## 4. Frontend Next.js (`my-app`)
- Next.js 16 + React 19 (App Router). Toàn bộ request đi qua Gateway với `credentials: "include"`; token JWT được lưu trong HTTP-only cookie.
- Server actions và route handlers proxy các endpoint backend (`/api/auth/login`, `/api/jobs/public`, `/api/applications`, …); lỗi chuẩn hóa về JSON thống nhất.
- Landing page sử dụng `GET /api/jobs/public`, khu vực candidate thao tác hồ sơ/cv, recruiter dashboard đọc dữ liệu qua API nội bộ. CORS gateway phải whitelists domain frontend tương ứng.

## 5. Messaging & tích hợp chéo

| Sự kiện                    | Producer            | Consumer chính                               | Mục đích chính                                                     |
| -------------------------- | ------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| `user.invited`             | Auth Service        | Notification Service                          | Gửi email lời mời tham gia công ty                                 |
| `user.registered`          | Auth Service        | Notification Service, User Profile Service    | Gửi OTP/ chào mừng, tạo profile mặc định                           |
| `password.reset.requested` | Auth Service        | Notification Service                          | Gửi OTP đặt lại mật khẩu                                           |
| `application.status.changed`| Application Service| Notification Service                          | Cập nhật trạng thái pipeline cho ứng viên                          |
| `interview.scheduled`      | Interview Service   | Notification Service                          | Gửi mail lịch + ICS                                                |
| `interview.rescheduled`    | Interview Service   | Notification Service                          | Thông báo lịch mới                                                  |
| `company.user.locked`      | Company Service     | Notification Service, Auth Service            | Khóa recruiter và chặn đăng nhập                                   |
| `company.status.changed`   | Company Service     | Notification Service                          | Báo cho admin khi trạng thái doanh nghiệp thay đổi                  |

Các API nội bộ khác chạy qua gateway (`/api/internal/**`) để bảo toàn observability nhưng cần được bảo vệ ở cấp hạ tầng mạng.

## 6. Thiết lập và chạy cục bộ

### Yêu cầu
- **JDK 17** (phù hợp `pom.xml`), Maven 3.9+.
- **Node.js 20+** và pnpm/npm để chạy Next.js.
- **Docker & Docker Compose** cho RabbitMQ/Supabase (nếu không dùng bản SaaS).
- Supabase account (PostgreSQL + Storage + pgvector) và khóa API Gemini nếu muốn chạy tính năng chat/generate CV.

### Các bước gợi ý
1. Sao chép `.env` mẫu và điền các biến bắt buộc:
   - Postgres: `SUPABASE_HOST/PORT/DB/USERNAME/PASSWORD`, `SUPABASE_URL`, `SUPABASE_KEY`.
   - Bảo mật: `APP_JWT_SECRET`, `GATEWAY_BASE_URL`.
   - Email: `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME/PASSWORD`.
   - AI: `GEMINI_API_KEY`, `GEMINI_MODEL`, `cv.pdf.font-path`, `CHAT_DB_URL/USERNAME/PASSWORD`, `SPRING_AI_OPENAI_API_KEY` (embedding nếu đổi model).
   - Chat/branding: `COMPANY_NAME`, `CAREERS_URL`, `POLICY_URL`, `CHAT_RECOMMEND_TOP_K`, `CHAT_RECOMMEND_FRESHNESS_DAYS`, `app.chat.rate-limit.requests-per-minute`.
2. Build backend: `mvn clean package` (hoặc `mvn -pl backend/<service> package`). Ví dụ chat-service: `cd backend/chat-service && mvn clean package`.
3. Khởi động hạ tầng bắt buộc: `docker compose up rabbitmq` (tham chiếu `docker-compose.yml`). Supabase sử dụng dịch vụ cloud, vì vậy chỉ cần chắc chắn biến môi trường đúng.
4. Chạy từng microservice bằng `mvn -pl backend/<service> spring-boot:run -am` để tận dụng devtools. Mỗi service đọc cấu hình từ `.env`, nên export biến trước khi chạy (PowerShell: `Get-Content .env | foreach { if($_) { $name,$value = $_.Split('='); Set-Item -Path Env:$name -Value $value } }`).
5. Khởi động gateway (`cd backend/gateway-service && mvn spring-boot:run`) rồi các service khác; mọi request frontend sẽ đi qua gateway.
6. Frontend: `cd my-app && npm install && npm run dev` (đảm bảo `NEXT_PUBLIC_API_BASE_URL` trỏ về gateway, ví dụ `http://localhost:8080`). Giao diện đọc dữ liệu job/public ngay khi khởi động.
7. Khi nâng cấp `app.jwt.secret` hoặc whitelist CORS, cần đồng bộ lại gateway + toàn bộ resource service để tránh lỗi xác thực.

## 7. Triển khai sản phẩm (GKE)
1. Build image: `docker build -t gcr.io/<project>/<service>:<tag> backend/<service>`.
2. Đăng nhập GCP rồi `docker push` lên Artifact Registry.
3. Cập nhật manifest trong `k8s/` để tham chiếu image mới, apply bằng `kubectl apply -f k8s/`.
4. Kubernetes Deployment tạo Pod/Container, Service (ClusterIP/LoadBalancer) và ConfigMap/Secret tương ứng.
5. Lấy `EXTERNAL-IP` từ Service hoặc Ingress, cấu hình DNS (ví dụ `talentflow-vn.online`) trỏ về IP này.
