package dev.gizem.qa;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;

@Epic("Storefront API")
@Feature("Product catalogue")
class ProductApiTest extends ApiTestBase {

    @Test
    @Story("List products")
    void listsProductsUsingThePublishedContract() {
        given()
                .spec(requestSpec)
        .when()
                .get("/api/products")
        .then()
                .statusCode(200)
                .body(matchesJsonSchemaInClasspath("schemas/product-list.schema.json"))
                .body("count", equalTo(4))
                .body("items", hasSize(4));
    }

    @Test
    @Story("Filter products")
    void filtersProductsByCategory() {
        given()
                .spec(requestSpec)
                .queryParam("category", "Audio")
        .when()
                .get("/api/products")
        .then()
                .statusCode(200)
                .body("count", equalTo(2))
                .body("items.category", everyItem(equalTo("Audio")))
                .body("items[0].price", greaterThan(0.0f));
    }

    @Test
    @Story("Product not found")
    void returnsNotFoundForUnknownProduct() {
        given()
                .spec(requestSpec)
        .when()
                .get("/api/products/999")
        .then()
                .statusCode(404)
                .body("error", equalTo("Product not found"));
    }
}
