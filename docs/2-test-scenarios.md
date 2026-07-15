# 2. Top 10 Risk-Ranked Test Scenarios

| Rank | One-line scenario | Risk | Ranking rationale |
|---:|---|---|---|
| 1 | Persist the response against the correct authenticated account without cross-account data leakage. | Critical | Incorrect account association is a privacy and data-integrity failure that can corrupt user-level analytics and expose personal data. |
| 2 | Submit an exact valid suggestion and verify one HTTP 200 request, success UI, and correctly persisted record. | Critical | This is the primary business path; failure prevents completion or creates false completion. |
| 3 | Reject invalid free text without displaying success or recording a completed response. | Critical | Invalid data marked complete would silently contaminate downstream datasets and decision systems. |
| 4 | Prevent duplicate records when Next is double-clicked or a submission is retried. | Critical | Duplicate persistence can inflate completion metrics and break account-level reporting; behavior is currently unspecified. |
| 5 | Validate the complete FR-05 contract, including Boolean type, account values, local timestamps, locale, and temporal order. | High | Contract drift can break consumers or produce semantically incorrect records even when HTTP status is 200. |
| 6 | Verify default prefix filtering for partial matches, exact matches, and no-match input. | High | Incorrect filtering directly prevents selection and is central to the feature's purpose. |
| 7 | Verify backend-configured match-anywhere behavior and ensure it does not accidentally remain in prefix mode. | High | A configuration mismatch creates tenant/admin-specific failures that basic default-mode testing will miss. |
| 8 | Persist only the suggestions that match the submitted text under the active filtering mode. | High | Persisting unrelated suggestions misrepresents what the user saw and damages auditability and analysis quality. |
| 9 | Handle API timeout/4xx/5xx without false success, while allowing a safe retry. | High | A misleading success state causes data loss and makes recovery difficult. |
| 10 | Support predictable keyboard navigation: Tab order, Enter submission, and Escape clear/close behavior. | Medium | Keyboard defects reduce accessibility and efficiency, but do not normally corrupt data when mouse operation works. |
