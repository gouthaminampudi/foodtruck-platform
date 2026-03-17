FROM gradle:8.10.2-jdk21 AS build
WORKDIR /workspace

COPY settings.gradle build.gradle ./
COPY apps/api/build.gradle apps/api/build.gradle
COPY apps/api/src apps/api/src

RUN gradle --no-daemon :apps:api:bootJar

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/apps/api/build/libs/*.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
