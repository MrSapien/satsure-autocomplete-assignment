# Submission Checklist

- [ ] Read every document and rewrite any wording that does not reflect my own understanding.
- [ ] Run `npm ci` and `npx playwright install chromium` on Windows 10.
- [ ] Run `npm run typecheck`, `npm run test:api`, and `npm run test:ui`.
- [ ] Replace illustrative API paths and authentication with real environment values if provided.
- [ ] Confirm how match-anywhere mode is enabled in the actual application.
- [ ] Confirm invalid-input status code, exact validity rules, and duplicate-submission behavior.
- [ ] Capture the final Playwright HTML report or screenshots if requested.
- [ ] Add the official complete AI conversation JSON export, not only the manually captured visible transcript.
- [ ] Verify that prompt files include every prompt used after downloading this repository.
- [ ] Commit with meaningful messages and push to a clean Git repository.
- [ ] Remove secrets, tokens, `.env`, test accounts beyond those supplied, and generated `node_modules`.
- [ ] Be prepared to explain the suggestion-list ambiguity, locale distinction, POM design, schema choices, and local-mock trade-off.
