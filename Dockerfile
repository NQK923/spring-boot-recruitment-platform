ARG SERVICE_MODULE=backend/discovery-service
ARG MAVEN_BUILD_ARGS="clean package -DskipTests"

FROM maven:3.9.9-eclipse-temurin-17 AS builder
ARG SERVICE_MODULE
ARG MAVEN_BUILD_ARGS
WORKDIR /workspace

# Sao chép mã nguồn cần thiết cho module đang build
COPY pom.xml .
COPY backend ./backend

# Build module chỉ định bằng Maven (mặc định bỏ qua test để giảm thời gian)
RUN mvn -pl ${SERVICE_MODULE} -am ${MAVEN_BUILD_ARGS}

# Chuẩn hóa tên file JAR để stage sau có thể copy dễ dàng
RUN set -eux; \
    ARTIFACT_PATH=$(find ${SERVICE_MODULE}/target -maxdepth 1 -type f -name "*.jar" ! -name "*-sources.jar" ! -name "*-javadoc.jar" ! -name "*-plain.jar" ! -name "original-*.jar" | head -n 1); \
    if [ -z "$ARTIFACT_PATH" ]; then \
        echo "Không tìm thấy file JAR cho module ${SERVICE_MODULE}" >&2; \
        exit 1; \
    fi; \
    cp "$ARTIFACT_PATH" /workspace/app.jar

FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

COPY --from=builder /workspace/app.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
