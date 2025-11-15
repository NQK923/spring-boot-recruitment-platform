# Triển khai Kubernetes (k8s)

Thư mục `k8s/` được tách rõ:
- `base/`: namespace, config map, secret, RabbitMQ, PVC cho file-service, ingress cho gateway.
- `services/`: mỗi dịch vụ một file Deployment + Service (discovery, gateway, auth, company, job, application, user-profile, interview, notification, file-storage, chat, frontend).

> Chỉnh sửa lại các giá trị placeholder (secret, host ingress) trước khi áp dụng.

## 1. Build & push image

Đặt biến registry: `REG=<registry>/<project>`.

Backend:
```bash
docker build -f Dockerfile --build-arg SERVICE_MODULE=backend/discovery-service -t $REG/discovery-service:latest .
docker build -f Dockerfile --build-arg SERVICE_MODULE=backend/gateway-service -t $REG/gateway-service:latest .
docker build -f Dockerfile --build-arg SERVICE_MODULE=backend/auth-service -t $REG/auth-service:latest .
docker build -f Dockerfile --build-arg SERVICE_MODULE=backend/company-service -t $REG/company-service:latest .
docker build -f Dockerfile --build-arg SERVICE_MODULE=backend/job-service -t $REG/job-service:latest .
docker build -f Dockerfile --build-arg SERVICE_MODULE=backend/application-service -t $REG/application-service:latest .
docker build -f Dockerfile --build-arg SERVICE_MODULE=backend/user-profile-service -t $REG/user-profile-service:latest .
docker build -f Dockerfile --build-arg SERVICE_MODULE=backend/interview-service -t $REG/interview-service:latest .
docker build -f Dockerfile --build-arg SERVICE_MODULE=backend/notification-service -t $REG/notification-service:latest .
docker build -f Dockerfile --build-arg SERVICE_MODULE=backend/file-storage-service -t $REG/file-storage-service:latest .
docker build -f Dockerfile --build-arg SERVICE_MODULE=backend/chat-service -t $REG/chat-service:latest .
```
Frontend:
```bash
docker build -f my-app/Dockerfile -t $REG/frontend:latest my-app
```
Push các image lên registry của bạn.

## 2. Cấu hình biến môi trường

- `base/secret.yaml`: điền giá trị thật cho Supabase, JWT, OAuth, Gemini, SMTP, thương hiệu (brand).
- `base/configmap.yaml`: chỉnh RabbitMQ (nếu không dùng mặc định), `GATEWAY_BASE_URL`, `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` (nếu không dùng service name mặc định), `NEXT_PUBLIC_API_BASE_URL` cho frontend.
- `services/*`: đã trỏ sẵn tới registry `asia-southeast1-docker.pkg.dev/glass-respect-478307-a3/nqk/<service>:latest`; cập nhật tag nếu bạn dùng phiên bản khác.
- File-service dùng PVC `file-storage-pvc` (5Gi). Sửa lại nếu cần kích thước/StorageClass khác.

## 3. Áp dụng manifest

```bash
kubectl apply -f k8s/base
kubectl apply -f k8s/services
```

- Ingress cho gateway (host mặc định `recruitment.local`, trong `base/ingress-gateway.yaml`) và frontend (`frontend.local`, trong `base/ingress-frontend.yaml`). Đổi host/TLS theo môi trường của bạn.
- Tất cả Service là ClusterIP, traffic đi qua gateway + ingress.

## 4. Lưu ý vận hành

- `APP_JWT_SECRET` phải đồng nhất gateway và toàn bộ service.
- Các service dùng Eureka nội bộ `http://discovery-service:8761/eureka/`.
- RabbitMQ chạy nội bộ (5672, 15672). Bật ingress/port-forward nếu cần truy cập UI quản trị.
- Frontend manifest đã có, trỏ `NEXT_PUBLIC_API_BASE_URL` về gateway trong cluster.
