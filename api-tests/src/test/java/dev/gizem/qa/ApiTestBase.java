package dev.gizem.qa;

import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import org.junit.jupiter.api.BeforeAll;

abstract class ApiTestBase {
    protected static RequestSpecification requestSpec;

    @BeforeAll
    static void configureApiClient() {
        String baseUrl = System.getenv().getOrDefault("API_BASE_URL", "http://127.0.0.1:3000");
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
        requestSpec = new RequestSpecBuilder()
                .setBaseUri(baseUrl)
                .setContentType(ContentType.JSON)
                .setAccept(ContentType.JSON)
                .build();
    }
}
