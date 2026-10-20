# API Testing Showcase

REST API test suite built with **Axios + TypeScript**, **Zod** contract validation and **Playwright Test** as the runner (parallel execution, fixtures, no browser needed), with a readable **Allure report** that shows every request and response.

It tests the public [JSONPlaceholder](https://jsonplaceholder.typicode.com) API, and ships with a small local mock so the whole suite also runs offline and deterministically in CI.

## The report

Every run produces **one self-contained HTML file**: `allure-report/index.html`. Open it with a double click. No server, no Java, nothing to install to read it.

- Every HTTP call is a step (`GET /posts?userId=3`) with the **request** and the **response** (status, headers, JSON body, timing) as expandable attachments. When a check fails you see exactly what went over the wire.
- Verifications are named steps: *Verify every post matches the contract*.
- Tests grouped by feature and endpoint, with severity (`@smoke` tests are *critical*).
- Secrets are masked: `Authorization`, cookies and API-key headers appear as `***`.

In CI the latest report from `main` is published to GitHub Pages.

## What it covers

| Area | Checks |
| --- | --- |
| `GET /posts` | full collection, unique ids, contract on every item, `userId` filter, empty result |
| `GET /posts/:id` | single resource, 404 for `0`, `101`, `9999` and a non-numeric id, nested `/comments` |
| Write operations | `POST` (201 + echoed payload), `PUT`, `PATCH` (only sent fields change), `DELETE` |
| Users | list, single user, 404, contract on every item |
| Cross-resource | every post belongs to an existing user (referential integrity) |

17 tests. `@smoke` marks the critical subset.

## Project structure

```
src/
  client/     Axios instance (base URL, timeout, status handling)
  api/        Typed wrappers per resource (PostsApi, UsersApi); no assertions
  schemas/    Zod schemas = the API contract
  reporting/  Axios adapter that records each call as a report step
  utils/      expectSchema(): contract assertion with readable failures
tests/        Specs + fixtures that inject the API wrappers and label every test
mock/         Offline stand-in for the JSONPlaceholder subset under test
allurerc.mjs  Report configuration (single-file output, grouping)
```

## Design decisions

- **Contract over spot checks.** Zod schemas validate the shape of every response item, so a renamed or retyped field fails with the exact path in the report.
- **Assertions live in tests, not in wrappers.** The `api/` layer only sends requests and returns typed responses; it never hides a check.
- **Reporting lives in the transport.** The request/response capture is an Axios adapter, so wrappers and specs stay free of logging code and every call is recorded the same way.
- **Errors are data.** The Axios client resolves for any status (`validateStatus: () => true`), so 4xx/5xx cases are asserted explicitly instead of caught.
- **Deterministic CI.** Pipelines run against the local mock, so a third-party outage or rate limit can never turn the build red. The live API stays one command away.
- **Fixtures for dependency injection.** Specs ask for `posts` / `users` and get a configured client.

## Getting started

```bash
npm install
npm run test:mock          # offline, against the local mock (starts it automatically)
npm test                   # live run against jsonplaceholder.typicode.com
npm run report             # builds allure-report/index.html
npm run typecheck
```

Then open `allure-report/index.html` in any browser.

Point it at another API with `API_BASE_URL=https://api.example.com npm test`.

## CI

`.github/workflows/api-tests.yml` (GitHub Actions) and `.gitlab-ci.yml` (GitLab CI) run the typecheck and the mock-backed suite, then build the report and keep it as an artifact, even when tests fail. The GitLab job also exposes JUnit results.

The GitHub workflow also publishes the report to GitHub Pages from `main` (one-time setup: *Settings > Pages > Source: GitHub Actions*).
