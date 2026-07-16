# Building a Full-Stack QA Automation Framework: From UI Flows to CI Quality Gates

*A practical quality engineering project combining browser, API, contract, performance, and CI testing.*

Modern quality engineering is broader than automating a few browser scenarios. A reliable test strategy needs fast service-level feedback, contract protection, realistic user journeys, measurable performance thresholds, useful failure artifacts, and repeatable execution in CI.

I built the **Full-Stack QA Automation Framework** as a hands-on project to bring these layers together around a small, self-contained storefront called **Quality Market**.

The source code is available on GitHub:

https://github.com/gizemdemirtaass/full-stack-qa-automation-framework

## What I wanted to demonstrate

The main goal was not simply to increase the number of automated tests. I wanted to design a maintainable quality ecosystem that answers different questions at the right level:

- Can a customer filter products, add an item, and complete checkout?
- Does the REST API return the correct status codes and response data?
- Do responses still match the published JSON contract?
- Does the service remain reliable under a small ramping load?
- Can every quality layer run automatically and independently in CI?
- Are useful reports and diagnostic artifacts available when something fails?

## The system under test

Quality Market is a lightweight storefront with a browser interface and REST API. It includes a deterministic four-product catalogue, category filtering, a cart, order creation, and order retrieval.

The application intentionally uses Node.js core modules instead of a large application framework. This keeps the project focused on test architecture while still providing a real UI and API to exercise.

The main endpoints are:

- `GET /health`
- `GET /api/products`
- `GET /api/products/{productId}`
- `POST /api/orders`
- `GET /api/orders/{orderId}`

## Architecture and technology stack

The framework combines several complementary layers:

- **UI automation:** Playwright, TypeScript, Page Object Model
- **API automation:** Java, REST Assured, JUnit 5, Hamcrest
- **Contract testing:** OpenAPI 3.1 and JSON Schema
- **Performance testing:** Grafana k6
- **Reporting:** Playwright HTML reports and Allure results
- **CI/CD:** GitHub Actions
- **Environment reproducibility:** Docker and Docker Compose

The structure keeps the application and test layers independent:

```text
app/                       Storefront UI and REST API
ui-tests/                  Playwright specs and page objects
api-tests/                 REST Assured and JUnit test suite
contracts/openapi.yaml     Published OpenAPI 3.1 contract
performance-tests/         k6 load scenario and thresholds
docs/TEST_STRATEGY.md      Risk model and quality gates
.github/workflows/         GitHub Actions pipeline
```

## UI automation with Playwright and TypeScript

The Playwright suite covers three high-value customer scenarios:

1. Filtering the catalogue by the Audio category
2. Adding a product to the cart and completing checkout
3. Verifying validation when checkout is attempted with an empty cart

The tests run against Chromium and Firefox in CI, producing six browser test executions in total.

I used the Page Object Model to keep selectors and user actions outside the test specifications. The `StorefrontPage` object owns operations such as opening the application, filtering by category, adding a named product, and submitting checkout.

Selectors rely on accessible roles and stable `data-testid` attributes instead of fragile CSS paths. This makes the tests easier to understand and less sensitive to visual layout changes.

For local learning and debugging, the project also provides different execution modes:

```bash
npm run test:ui          # Standard run
npm run test:ui:headed   # Visible Chromium run
npm run test:ui:watch    # Slower sequential run
npm run test:ui:debug    # Playwright Inspector and step-by-step debugging
```

## API testing with REST Assured and JUnit 5

The API suite contains five service-level scenarios.

### Product catalogue tests

The first test calls `GET /api/products` and verifies:

- HTTP status `200`
- Four returned products
- The expected response structure using JSON Schema

The category filtering test sends `category=Audio` and checks that:

- Two products are returned
- Every returned product belongs to the Audio category
- The product price is greater than zero

The negative product test requests `/api/products/999` and verifies:

- HTTP status `404`
- The error message `Product not found`

### Order lifecycle tests

The positive order test creates a new order with `POST /api/orders`. It checks the `201` response, UUID-formatted order ID, `CREATED` status, and creation timestamp. It then extracts the generated ID and retrieves the same order with `GET /api/orders/{id}`.

This is a service-level end-to-end flow because data created in one request is validated through a second endpoint.

The negative order test submits an empty `items` array and verifies that the API returns HTTP `400` with the expected validation message.

The latest local execution result was:

```text
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

## Contract testing with OpenAPI and JSON Schema

Functional assertions confirm individual values, but they may not detect an unexpected change in the response structure. For this reason, the product-list response is also validated against a JSON Schema.

The schema requires:

- `items` and `count` at the root level
- Required product fields: `id`, `name`, `category`, `price`, and `stock`
- Valid category values: `Audio` or `Office`
- Positive identifiers and prices
- No undocumented additional properties

The OpenAPI 3.1 file documents the same product and order resources, including successful and error responses. Together, the OpenAPI specification and executable schema assertion help make contract expectations visible and testable.

## Performance checks with k6

The k6 scenario gradually increases the number of virtual users to five, holds the load, and then ramps down. Each iteration calls both the catalogue and individual-product endpoints.

The release thresholds are explicit:

- Failed-request rate below 1%
- Successful check rate above 99%
- p95 response time below 500 ms

A local verification completed **300 requests and 600 checks with zero failures**. The purpose is not to claim production-scale capacity; it is to demonstrate how measurable performance expectations can become an automated quality gate.

## CI quality gates with GitHub Actions

The GitHub Actions workflow runs on pushes to `main`, pull requests, and manual dispatches. It separates quality responsibilities into three jobs:

1. **UI tests:** installs Chromium and Firefox, performs TypeScript type checking, runs Playwright tests, and uploads Playwright and Allure artifacts.
2. **API and contract tests:** starts the application, configures Java, runs the REST Assured/JUnit suite, and uploads Allure results.
3. **Performance smoke tests:** starts the application, installs k6, and enforces the defined thresholds.

Keeping these jobs independent makes failures easier to classify. A UI failure, API contract failure, or performance regression is visible as a separate CI signal.

## Reporting and failure diagnostics

Automation is only useful when failures can be investigated efficiently. The framework therefore supports:

- Playwright HTML reporting
- Allure result aggregation
- Traces on retry
- Screenshots and videos for failed UI runs
- Request and response logging when REST Assured validation fails
- CI artifact uploads even when a test job fails

These artifacts reduce the amount of time required to reproduce and understand a failed pipeline.

## Key design decisions and lessons

Several principles guided this project:

### Use the test pyramid intentionally

Browser tests provide confidence in customer journeys but are not the best place to cover every data combination. API tests give faster, more focused service feedback, while contract and performance checks address different risks.

### Keep test data deterministic

The catalogue is stable, while order IDs are generated dynamically. Assertions verify the format and lifecycle instead of depending on a hard-coded order identifier.

### Make environments configurable

Base URLs are provided through environment variables, allowing the same test suites to run locally, in Docker, or in GitHub Actions.

### Treat reports as part of the framework

Test results alone are not sufficient. Traces, screenshots, videos, logs, and reports are part of the debugging experience and should be designed from the beginning.

## Running the project locally

Start with the repository:

```bash
git clone https://github.com/gizemdemirtaass/full-stack-qa-automation-framework.git
cd full-stack-qa-automation-framework
npm ci
npx playwright install chromium firefox
```

Run the UI suite:

```bash
npm run test:ui
```

For API tests, start the application in one terminal:

```bash
npm start
```

Then run the REST Assured suite in another terminal:

```bash
npm run test:api
```

Run the k6 scenario while the application is available:

```bash
npm run test:performance
```

## What comes next

The next improvements I plan to explore include authentication and role-based scenarios, accessibility testing with axe-core, historical test trends, and scheduled regression execution against a hosted environment.

Building this project reinforced an important quality engineering principle for me: a strong automation framework is not defined by one tool. It is defined by how effectively different testing layers work together to provide fast, explainable, and repeatable feedback.

If you would like to review the implementation, test strategy, or CI pipeline, the complete project is available here:

https://github.com/gizemdemirtaass/full-stack-qa-automation-framework
