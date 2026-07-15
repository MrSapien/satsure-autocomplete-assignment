# 8. Test Architecture Discussion

## Design goals

- Keep tests readable enough to review during an interview.
- Separate user workflows from selectors and low-level contract validation.
- Support both a real environment and a deterministic local executable target.
- Fail with diagnostic messages that identify business-contract errors, not merely HTTP failures.
- Avoid overfitting tests to assumptions absent from the requirements.

## Repository layers

### UI Page Object layer
`tests/ui/pages/AutocompleteFormPage.ts` owns selectors and reusable user actions such as opening the form, typing, selecting, submitting, and reading visible suggestions. Test files express behavior and assertions rather than selector details.

### UI test layer
`tests/ui/tests/autocomplete-form.spec.ts` covers keyboard navigation, filtering modes, suggestion selection, success, error, request status, and core payload values.

### API schema layer
`tests/api/schema/autocomplete-response.schema.ts` describes required properties and types. Custom formats cover BCP 47 and local IST timestamps.

### API helper layer
- `contract-validator.ts` compiles and runs the schema.
- `suggestion-matcher.ts` independently calculates expected prefix/substring results and parses the comma-separated API field.

### API test layer
`tests/api/tests/autocomplete-api.spec.ts` validates the live GET contract, semantic values, matching-list accuracy, and negative POST cases.

### Configuration layer
`playwright.config.ts` defines separate UI and API projects. Environment variables make URLs, endpoints, and bearer authentication replaceable without code changes.

### Local executable fixture
The assignment's URL is illustrative and not reachable. `mock-app/` plus `scripts/mock-server.cjs` provides a deterministic reference implementation so reviewers can execute the suite. It is not presented as the production SUT. When real URLs are supplied, Playwright does not start the local server.

## Why TypeScript and Playwright Test

Using Playwright Test for UI and API automation gives one runner, one reporting model, shared fixtures, trace capture, and browser/API isolation. TypeScript adds compile-time checking to Page Object methods and response-helper code.

## Selector strategy

The supplied HTML offers stable IDs for input and button and stable classes for message/list containers. The suite uses those explicit selectors. In a production application, accessible-role locators should be preferred where names and roles are stable. Dynamic CSS chains, indexes, and timeout-based waits are avoided.

## Synchronization and flakiness controls

- Web-first Playwright assertions wait for observable state.
- Network assertions use `waitForRequest`/`waitForResponse` started before the action.
- Tests do not use hard sleeps.
- Trace, screenshot, and video are retained on failure.
- CI retries are limited and are diagnostic, not a substitute for fixing flaky tests.

## Data strategy

- The API seed record is deterministic and independent of UI submissions.
- Negative payloads change one contract dimension at a time.
- Matching expectations are calculated independently from the response.
- A real environment should create and clean up uniquely identified test data through API fixtures or dedicated test hooks.

## Suggested CI pipeline

1. Install dependencies with `npm ci`.
2. Install Chromium with `npx playwright install --with-deps chromium`.
3. Run `npm run typecheck`.
4. Run API tests.
5. Run UI Chromium tests.
6. Upload HTML report, traces, screenshots, and videos on failure.

## Production extensions

- Add authentication setup and stored session state after login scope is available.
- Add accessibility checks and screen-reader semantics for suggestions.
- Add cross-browser projects after Chrome acceptance is stable.
- Add idempotency/double-click, retry, timeout, 5xx, concurrency, and performance tests when API behavior is defined.
- Generate the API schema from an OpenAPI source to reduce contract duplication.
- Parameterize locale/timezone tests across supported regions.
- Integrate test results with CI quality gates and defect traceability.

## Trade-offs

A Page Object can become too large if every assertion is hidden inside it. This implementation keeps actions and selectors in the Page Object while leaving business assertions in tests. The local mock improves executability but cannot prove the real system works; real-environment execution remains essential before release.
