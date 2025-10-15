# Stage 1: Build the entire multi-module project
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Create the final image for the gateway-service
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/backend/gateway-service/target/*.jar app.jar

# Expose the port the app runs on
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
