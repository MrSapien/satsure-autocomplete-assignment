# 4. Detailed Test Cases

## TC-UI-001 — Tab navigation follows a logical form order

**Preconditions**
- Chrome on Windows 10.
- User is logged in and the autocomplete form is loaded.
- No modal or browser UI owns focus.

**Test Steps**
1. Load `/autocomplete-form`.
2. Press `Tab` once.
3. Observe the focused element.
4. Press `Tab` again.
5. Observe the focused element.

**Expected Results**
- After the first Tab, the text input is focused.
- After the second Tab, the Next button is focused.
- Focus is visible and does not move to hidden messages.

**Test Data**
- None.

---

## TC-UI-002 — Enter submits a valid value

**Preconditions**
- Form is loaded in default prefix mode.
- API is available.

**Test Steps**
1. Focus the input.
2. Enter `agile methodology`.
3. Press `Enter`.
4. Observe the network request and response.
5. Observe success and error containers.

**Expected Results**
- Exactly one submission request is sent.
- Response status is HTTP 200.
- Success message is visible.
- Error message is not visible.
- Persisted `text` equals the entered value.

**Test Data**
- `agile methodology`

---

## TC-UI-003 — Escape clears input and closes suggestions

**Preconditions**
- Form is loaded.

**Test Steps**
1. Type `agile`.
2. Verify matching suggestions are visible.
3. Press `Escape`.

**Expected Results**
- Input becomes empty.
- Suggestion list closes/hides.
- No submission is sent.

**Test Data**
- `agile`

---

## TC-UI-004 — Default prefix filtering returns only prefix matches

**Preconditions**
- Default prefix mode is enabled.
- Configured suggestions are the three supplied values.

**Test Steps**
1. Load the form.
2. Type `agile methodology p`.
3. Read all visible suggestion values.

**Expected Results**
- `agile methodology process` is visible.
- `agile methodology process testing` is visible.
- `agile methodology` is hidden.
- No unrelated value is visible.

**Test Data**
- Input: `agile methodology p`

---

## TC-UI-005 — No prefix match hides all suggestions

**Preconditions**
- Default prefix mode is enabled.

**Test Steps**
1. Load the form.
2. Type `water`.
3. Inspect the suggestion list.

**Expected Results**
- No suggestion item is visible.
- The list is empty or hidden without layout-breaking stale items.

**Test Data**
- `water`

---

## TC-UI-006 — Match-anywhere configuration returns substring matches

**Preconditions**
- Backend/Admin has enabled match-anywhere mode.

**Test Steps**
1. Load the form under match-anywhere configuration.
2. Type `methodology process`.
3. Read visible suggestions.

**Expected Results**
- `agile methodology process` is visible.
- `agile methodology process testing` is visible.
- `agile methodology` is hidden because it does not contain the full substring.

**Test Data**
- `methodology process`

---

## TC-UI-007 — Clicking a suggestion populates the input exactly

**Preconditions**
- Form is loaded with suggestions available.

**Test Steps**
1. Type `agile methodology proc`.
2. Click `agile methodology process`.
3. Inspect the input value.

**Expected Results**
- Input value becomes exactly `agile methodology process`.
- No partial or neighboring suggestion is selected.

**Test Data**
- Partial input: `agile methodology proc`
- Selected item: `agile methodology process`

---

## TC-UI-008 — Input accepts arbitrary user text before submission validation

**Preconditions**
- Form is loaded.

**Test Steps**
1. Focus the text input.
2. Enter `water management 123`.
3. Inspect the input value and suggestion list without selecting Next.

**Expected Results**
- The input contains exactly `water management 123`.
- No matching suggestion is visible.
- No validation error is shown before submission.
- No success state is shown.

**Test Data**
- `water management 123`

---

## TC-UI-009 — Invalid free text displays error and does not send a persistence request

**Preconditions**
- Form is loaded.

**Test Steps**
1. Start monitoring POST requests to the response persistence endpoint.
2. Enter `not a configured suggestion`.
3. Select Next.
4. Observe UI states and network traffic.

**Expected Results**
- Invalid-input error is visible.
- Success message remains hidden.
- No POST request is sent to the persistence endpoint.
- No completed record is created.

**Test Data**
- `not a configured suggestion`

---

## TC-API-001 — GET response matches the FR-05 contract

**Preconditions**
- A valid response exists for the test account.
- API authentication is configured where required.

**Test Steps**
1. Send GET to the configured response endpoint.
2. Verify HTTP status.
3. Parse the JSON body.
4. Validate required fields and schema types.
5. Validate email, timestamp, locale, and Boolean formats.

**Expected Results**
- HTTP 200 is returned.
- Every required property exists.
- `completed` is Boolean.
- Email is valid.
- Dates are valid local IST date-times.
- Locale is valid BCP 47.

**Test Data**
- Account `seed-valid` in the local executable fixture; real account endpoint is configurable.

---

## TC-API-002 — Persisted suggestion list contains exactly the current matches

**Preconditions**
- Prefix mode is active.
- A response with text `agile methodology process` is available.

**Test Steps**
1. GET the persisted response.
2. Split `suggestion_list` on commas and trim each item.
3. Independently calculate prefix matches from the configured source list.
4. Compare the arrays in order.

**Expected Results**
- Persisted list is exactly:
  - `agile methodology process`
  - `agile methodology process testing`
- `agile methodology` is not present.

**Test Data**
- Text: `agile methodology process`

---

## TC-API-003 — Missing required field is rejected

**Preconditions**
- Submission endpoint is available.

**Test Steps**
1. Build an otherwise valid payload.
2. Remove `account_email`.
3. POST the payload.

**Expected Results**
- HTTP 400 or the documented validation status is returned.
- Error identifies `account_email` as missing.
- No record is persisted.

**Test Data**
- Valid payload minus `account_email`.

---

## TC-API-004 — Wrong Boolean type is rejected

**Preconditions**
- Submission endpoint is available.

**Test Steps**
1. Build a valid payload.
2. Set `completed` to string `"true"`.
3. POST the payload.

**Expected Results**
- Validation error status is returned.
- Error identifies `completed` type failure.
- No invalid record is persisted.

**Test Data**
- `completed: "true"`

---

## TC-API-005 — Invalid locale syntax is rejected

**Preconditions**
- Submission endpoint is available.

**Test Steps**
1. Build a valid payload.
2. Set locale to `english_India`.
3. POST the payload.

**Expected Results**
- Validation error status is returned.
- Error identifies invalid locale.
- No invalid record is persisted.

**Test Data**
- `locale: "english_India"`

---

## TC-API-006 — Timestamp values use IST and preserve chronological order

**Preconditions**
- A completed response exists.

**Test Steps**
1. GET the persisted response.
2. Validate both timestamps end with `+05:30`.
3. Parse both timestamps.
4. Compare `end_date` with `start_date`.

**Expected Results**
- Both values are parseable date-times with IST offset.
- `end_date` is equal to or later than `start_date`.

**Test Data**
- Valid persisted response.

---

## TC-UI-010 — Double activation does not create duplicate completed responses

**Preconditions**
- Form is loaded with a valid exact suggestion selected.
- Network throttling is available so the first request remains in flight briefly.

**Test Steps**
1. Select `agile methodology`.
2. Double-click Next rapidly, or press Enter and immediately click Next.
3. Observe outgoing requests.
4. Query persisted responses for the account.

**Expected Results**
- The client disables or guards repeated submission while the first request is pending, or the backend applies idempotency.
- Only one logical completed response exists for the form attempt.
- The user sees one final success result.

**Test Data**
- `agile methodology`
- Same account and form-attempt identifier for both activations.

---

## TC-UI-011 — Submission API failure does not show false success

**Preconditions**
- Form is loaded with a valid value.
- Submission endpoint is configured to return HTTP 500 or a network failure.

**Test Steps**
1. Select `agile methodology`.
2. Select Next.
3. Observe the network result and UI state.
4. Restore the API and retry once.

**Expected Results**
- Success is not displayed for the failed request.
- A clear retryable error is displayed.
- The user's input remains available.
- A successful retry creates no duplicate record.

**Test Data**
- First response: HTTP 500 or connection failure.
- Retry response: HTTP 200.

---

## TC-API-007 — Response belongs to the authenticated account

**Preconditions**
- User `test123@gmail.com` is authenticated.
- A completed response exists.

**Test Steps**
1. Send GET using the authenticated user's session/token.
2. Inspect `account_email` and `account_id`.
3. Attempt to retrieve another account's response identifier if access-control test data is available.

**Expected Results**
- The normal response contains `test123@gmail.com` and the expected account ID.
- Another account's data is not returned; the API returns the documented authorization/not-found status.
- No cross-account fields are leaked in the error response.

**Test Data**
- Authorized email: `test123@gmail.com`
- Authorized account ID: `98765` in the supplied example.
- Separate unauthorized test account/response fixture where available.
