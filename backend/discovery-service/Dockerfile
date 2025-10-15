# Stage 1: Build the entire multi-module project
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
# Using package instead of install to avoid installing artifacts to local repo
RUN mvn clean package -DskipTests

# Stage 2: Create the final image for the discovery-service
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# The JAR file will be in the target directory of the specific module
COPY --from=build /app/backend/discovery-service/target/*.jar app.jar

# Expose the port the app runs on
EXPOSE 8761

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
