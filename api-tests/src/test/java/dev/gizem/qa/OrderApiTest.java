package dev.gizem.qa;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.restassured.response.Response;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.notNullValue;

@Epic("Storefront API")
@Feature("Order lifecycle")
class OrderApiTest extends ApiTestBase {

    @Test
    @Story("Create and retrieve order")
    void createsAndRetrievesAnOrderEndToEnd() {
        Map<String, Object> payload = Map.of(
                "customerEmail", "gizem.qa@example.com",
                "items", List.of(Map.of("productId", 1, "quantity", 1))
        );

        Response createResponse = given()
                .spec(requestSpec)
                .body(payload)
        .when()
                .post("/api/orders")
        .then()
                .statusCode(201)
                .body("id", matchesPattern("^[0-9a-f-]{36}$"))
                .body("status", equalTo("CREATED"))
                .body("createdAt", notNullValue())
                .extract().response();

        String orderId = createResponse.path("id");

        given()
                .spec(requestSpec)
        .when()
                .get("/api/orders/{id}", orderId)
        .then()
                .statusCode(200)
                .body("id", equalTo(orderId))
                .body("customerEmail", equalTo("gizem.qa@example.com"));
    }

    @Test
    @Story("Reject invalid order")
    void rejectsAnOrderWithoutItems() {
        given()
                .spec(requestSpec)
                .body(Map.of("customerEmail", "gizem.qa@example.com", "items", List.of()))
        .when()
                .post("/api/orders")
        .then()
                .statusCode(400)
                .body("error", equalTo("customerEmail and at least one item are required"));
    }
}
