# Stage 1: Build the entire multi-module project
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Create the final image for the auth-service
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/backend/auth-service/target/*.jar app.jar

# No EXPOSE needed as it uses a random port assigned by Spring Boot

ENTRYPOINT ["java", "-jar", "app.jar"]
