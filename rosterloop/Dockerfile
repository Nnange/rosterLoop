# --- Production Stage ---
# Expects the JAR to be pre-built (e.g., by Jenkins: mvn clean package -DskipTests)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 9092

ENTRYPOINT ["java", "-jar", "app.jar"]
