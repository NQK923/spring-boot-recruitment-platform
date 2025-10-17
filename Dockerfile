# This Dockerfile assumes the JAR files have already been built by Maven

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Argument to specify which JAR file to copy
ARG JAR_FILE_PATH

# Copy the pre-built JAR file from the host into the image
COPY ${JAR_FILE_PATH} app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
