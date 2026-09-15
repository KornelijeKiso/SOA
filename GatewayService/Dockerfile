FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew --no-daemon bootJar -x test && cp build/libs/*.jar /app/gateway.jar

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/gateway.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
