# SatSure Autocomplete Form — Practical Assignment

Risk-based requirement analysis, detailed UI/API test design, and executable Playwright automation for the supplied Autocomplete Form.

## What is included

- Top 10 risk-ranked test scenarios.
- Detailed requirement analysis and explicit assumptions.
- Complete comparison of the supplied GET response against FR-05.
- 17 detailed manual test cases across UI and API behavior.
- TypeScript Playwright Page Object Model.
- UI automation for Tab, Enter, Escape, filtering, selection, success, and error behavior.
- API contract/schema, type, timestamp, BCP 47 locale, and suggestion-list validation.
- Three negative API tests.
- Local mock UI/API for deterministic execution.
- Configuration for running the same suite against a real environment.
- AI prompt, visible JSON transcript, and AI-reflection documentation.

## Repository structure

```text
├── README.md
├── docs/
│   ├── 1-requirement-analysis.md
│   ├── 2-test-scenarios.md
│   ├── 3-defect-identification.md
│   ├── 4-test-cases.md
│   ├── 7-ai-reflection.md
│   └── 8-architecture-discussion.md
├── tests/
│   ├── ui/
│   │   ├── pages/
│   │   ├── tests/
│   │   └── config/
│   └── api/
│       ├── fixtures/
│       ├── helpers/
│       ├── schema/
│       └── tests/
├── mock-app/
├── scripts/
├── prompts/
├── ai-transcripts/
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 20 or newer.
- npm.
- Windows 10, macOS, or Linux. The requested browser project uses Chromium/Desktop Chrome behavior.

## Install

```bash
npm install --include=dev
npx playwright install chromium
```

For a first checkout without `package-lock.json`, use:

```bash
npm install
npx playwright install chromium
```

## Run the complete suite locally

No real SatSure application URL was provided. By default, Playwright starts the included local mock application and API.

```bash
npm test
```

Open the HTML report:

```bash
npm run report
```

## Useful commands

```bash
npm run typecheck
npm run test:ui
npm run test:api
npm run test:headed
npm run test:debug
```

## Run against a real environment

The local server is disabled automatically when a real UI or API base URL is supplied.

### PowerShell

```powershell
$env:TARGET_BASE_URL = "https://test.com"
$env:FORM_PATH = "/autocomplete-form"
$env:API_BASE_URL = "https://test.com/api"
$env:API_RESPONSE_PATH = "/responses/98765"
$env:API_SUBMISSION_PATH = "/responses"
$env:API_BEARER_TOKEN = "replace-if-required"
npm test
```

### Bash

```bash
TARGET_BASE_URL="https://test.com" \
FORM_PATH="/autocomplete-form" \
API_BASE_URL="https://test.com/api" \
API_RESPONSE_PATH="/responses/98765" \
API_SUBMISSION_PATH="/responses" \
API_BEARER_TOKEN="replace-if-required" \
npm test
```

Because the assignment does not provide real endpoint paths, authentication, or a mechanism for enabling match-anywhere mode, update these configuration values and the mode setup once the real environment is known.

## Important requirement decisions

- `completed` must be a JSON Boolean, not a string.
- Local timestamps are validated as RFC 3339-style values with `+05:30`.
- `en` is valid BCP 47 syntax, but `en-IN` is the environment-specific expected value for English in India.
- For input `agile methodology`, all three supplied suggestions are valid prefix matches. The suite does not incorrectly fail merely because the result contains the full configured list.
- The schema permits additional fields because FR-05 requires fields but does not prohibit extra metadata.

## Local mock vs real system

The mock exists only to demonstrate that the automation is executable. It must not be treated as proof of the real application's quality. Before release or final evaluation with environment access, rerun the same tests against the actual UI/API and update any assumptions with confirmed product behavior.

## AI evidence — mandatory final check

The assignment explicitly requires prompt files and a complete JSON transcript.

This repository contains:

- `prompts/01-primary-assignment-prompt.txt`
- `prompts/02-generation-instructions.txt`
- `ai-transcripts/visible-conversation.json`
- `ai-transcripts/README.md`

The included JSON records the visible working interaction used for this generated repository. Before submission, add the platform's official full export or ensure the evaluator accepts the manually captured visible transcript. Do not claim that hidden system instructions or private model reasoning are part of the transcript.

## Local Verification

The project was verified locally on Windows using the following environment:

- Operating system: Windows 10
- Browser: Playwright Chromium
- Node.js: `v24.18.0`
- npm: `11.16.0`
- Playwright: `Version 1.61.1`

Verification results:

- `npm run typecheck` — Passed
- `npm run test:api` — `8` passed
- `npm run test:ui` — `10` passed

The UI suite includes an additional test separating arbitrary text entry
under FR-01 from submission validation under FR-04. The invalid-input test
also verifies that no persistence POST request is sent.

## References

- Playwright Test documentation: https://playwright.dev/docs/intro
- Playwright API testing: https://playwright.dev/docs/api-testing
- Playwright Page Object Model guidance: https://playwright.dev/docs/pom
- RFC 5646, Tags for Identifying Languages: https://www.rfc-editor.org/info/rfc5646
