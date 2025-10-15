# Stage 1: Build the entire multi-module project
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Create the final image for the user-profile-service
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/backend/user-profile-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
