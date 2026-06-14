# Build stage
FROM maven:3-eclipse-temurin-24-alpine AS build
WORKDIR /app
COPY pom.xml .
# Tải các dependency trước để tận dụng Docker cache
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:24-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 9090
ENTRYPOINT ["java", "--enable-native-access=ALL-UNNAMED", "--sun-misc-unsafe-memory-access=allow", "--add-opens", "java.base/java.nio=ALL-UNNAMED", "--add-opens", "java.base/sun.nio.ch=ALL-UNNAMED", "--add-opens", "java.base/jdk.internal.misc=ALL-UNNAMED", "-jar", "app.jar"]
