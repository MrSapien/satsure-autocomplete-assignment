# 1. Requirement Analysis

## 1.1 Scope

The system under test is the authenticated user's Autocomplete Form at `/autocomplete-form`. Login and Admin configuration are outside the stated scope. Testing covers the browser form, suggestion filtering, keyboard behavior, submission behavior, and the persisted API response contract.

## 1.2 Requirement-to-test interpretation

### FR-01 — Text input
- The input accepts keyboard text.
- A visible suggestion can be clicked and its complete text must populate the input.
- The phrase “type any response” describes input capability, not necessarily submission validity, because FR-04 explicitly defines an invalid-input state.
- Arbitrary text entry is tested separately from submission validation so that FR-01 input capability is not confused with FR-04 validity rules.

### FR-02 — Prefix matching
- Matching is case-insensitive unless the product specifies otherwise.
- A suggestion remains visible only when its normalized value starts with the normalized typed text.
- Empty input displays the full configured list.
- No matching prefix produces an empty/hidden list.

### FR-03 — Match-anywhere configuration
- When backend configuration enables this mode, the filter changes from `startsWith` to `contains`.
- The test environment needs a deterministic way to select the mode. The local executable fixture uses `?mode=anywhere`; a real environment should replace this with its actual configuration mechanism.

### FR-04 — Submission
- A valid submission sends one REST request when Next or Enter is used.
- HTTP 200 results in a visible success state and no visible error state.
- Invalid text results in a visible validation error and must not display success.
- The invalid-input HTTP status is not specified. API-negative tests use HTTP 400 as an explicit assumption.
- Under the documented client-side exact-match assumption, invalid text must not send a persistence POST request.

### FR-05 — Persistence contract
The response must contain:
- `account_id`: non-empty identifier. The sample represents it as a string, so the automation uses string type while documenting that the requirement does not explicitly define the type.
- `account_email`: valid email belonging to the logged-in account.
- `start_date`: local IST timestamp recorded when the form is reached.
- `end_date`: local IST timestamp recorded when submission is selected; it must not precede `start_date`.
- `locale`: valid BCP 47 language tag. For the stated India/English environment, expected value is `en-IN`.
- `text`: exact submitted input text.
- `suggestion_list`: comma-separated suggestions matching the submitted text according to the active matching mode.
- `completed`: JSON Boolean.

## 1.3 Ambiguities and assumptions

1. **Title mismatch:** Requirements say the form contains a title, but the supplied HTML has no heading/title element inside the form.
2. **Stray markup:** The character `v` after `</head>` appears accidental.
3. **Validity rule:** The exact boundary between acceptable free text and invalid input is not defined. Tests assume a submission is valid only when the text exactly equals a configured suggestion because the error instructs the user to select a valid suggestion.
4. **Case and whitespace:** Tests normalize case for matching and trim leading/trailing submission whitespace. The product should explicitly define these behaviors.
5. **Keyboard behavior:** Enter and Escape are required by the practical exercise but not by FR-01–FR-05. Tests assume Enter submits and Escape clears the input and closes the list.
6. **Timestamp serialization:** “User's local time” is interpreted as RFC 3339/ISO 8601 with the explicit `+05:30` offset, not a UTC `Z` value.
7. **Locale value:** `en` is itself a valid BCP 47 tag. However, it does not preserve the India regional context expected from the supplied environment, so `en-IN` is used as the environment-specific expected value.
8. **Suggestion-list contradiction:** For text `agile methodology`, all three configured suggestions are valid prefix matches. Therefore, a rule saying the API must return “not all suggestions” conflicts with FR-02 for this particular test value. Automation calculates the expected matches rather than asserting an arbitrary list size.
9. **Additional response fields:** FR-05 requires listed fields but does not prohibit extra metadata. The JSON schema therefore permits additional properties.
10. **Endpoint/authentication:** The actual API paths and authentication mechanism are not provided. They are configurable through environment variables.
11. **Duplicate submissions:** Idempotency behavior is not specified. It remains a high-risk scenario and should be clarified.
12. **Error recovery:** Expected UI behavior for timeout, HTTP 5xx, or network failure is not specified.

## 1.4 Testability recommendations

- Add stable accessible roles/names and expose the active matching mode in a test-safe manner.
- Define exact validation, case, whitespace, duplicate-submission, and retry rules.
- Publish an OpenAPI contract with required types, formats, status codes, and examples.
- Define whether `suggestion_list` is a snapshot at submission time, the exact selected item, or the full set matching the submitted text.
- Use a server-generated immutable response identifier and an idempotency key for submission retries.
