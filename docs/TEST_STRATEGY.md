# Test strategy

## Scope

The portfolio applies a risk-based test pyramid to a small storefront:

- UI end-to-end tests cover the highest-value customer flows.
- REST Assured tests cover API behaviour, negative cases and service integration.
- JSON Schema assertions verify response contracts published through OpenAPI 3.1.
- k6 verifies basic reliability thresholds before release.

## Quality gates

| Layer | Gate |
|---|---|
| Type safety | TypeScript compiler completes without errors |
| UI | All Chromium and Firefox tests pass; failures retain trace, screenshot and video |
| API | All JUnit/REST Assured tests pass with contract validation |
| Performance | Error rate below 1%, check rate above 99%, p95 below 500 ms |
| Reporting | Playwright HTML and Allure result artifacts are retained in CI |

## Test data and environments

- The application owns deterministic product test data.
- Orders use generated UUIDs and unique test identities.
- Base URLs are injected through environment variables.
- Docker Compose provides reproducible service discovery and dependencies.

## Continuous improvement metrics

The project is structured to track pass rate, duration, retries/flaky tests, p95 latency and failed checks. CI artifacts preserve traces and reports for root-cause analysis.
