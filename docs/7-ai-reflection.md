# 7. AI Usage Reflection

## Tools Used

I used ChatGPT (GPT-5.6 Thinking) as a reasoning, drafting, and coding assistant. I also used web search restricted to official Playwright documentation and the RFC Editor to verify current Playwright capabilities and the BCP 47 reference.

## Usage Areas

- Decomposing the functional requirements and identifying ambiguities.
- Producing an initial risk-ranked scenario set and detailed test-case structure.
- Drafting a TypeScript Playwright Page Object Model.
- Drafting UI and API automation, JSON-schema validation, and a configurable local test fixture.
- Reviewing the supplied API response against the contract.
- Organizing README, architecture, assumptions, and traceability documentation.

## Modifications Made to AI Output

### 1. Corrected the initial temptation to report `suggestion_list` as defective
A simplistic interpretation was that the API should not return all suggestions. I recalculated the expected prefix matches using FR-02. All three configured suggestions begin with `agile methodology`, so all three are valid matches for that exact input. I documented the later “not all suggestions” wording as a requirement conflict and added a stronger case using `agile methodology process`, which should return only two values.

**Reasoning:** A tester should not create a defect merely because an expected answer seems implied. The actual filtering rule and test data must be applied consistently.

### 2. Separated BCP 47 syntax validity from environment correctness
The first draft treated `locale: "en"` as simply invalid. I corrected that: `en` is a valid BCP 47 language tag. The issue is that it does not preserve the India regional context expected from the stated English/India environment, for which `en-IN` is the appropriate expected value.

**Reasoning:** Schema-format validation and business/environment validation are different checks and should produce different diagnostic messages.

### 3. Allowed additional JSON properties
An early strict schema approach would have used `additionalProperties: false`. I changed it to `true` because FR-05 says the response must contain the listed fields but does not say that no other metadata may exist.

**Reasoning:** Tests should not reject behavior that the requirement does not prohibit.

### 4. Added dual execution modes rather than hard-coding the fictional URL
The assignment provides `https://test.com/autocomplete-form`, but no reachable application or API contract. I added environment-variable configuration for a real target and a local mock application/API for deterministic execution.

**Reasoning:** This makes the submitted scripts executable while keeping the test code portable to the actual SatSure environment.

### 5. Separated FR-01 text entry from FR-04 submission validation

The generated UI suite typed invalid free text only inside the invalid-submission test. I added a dedicated test that proves arbitrary text can be entered before validation, then strengthened the invalid-submission test to assert that no persistence POST request is sent.

**Reasoning:** Input capability and submission validity are separate requirements. Testing them independently gives clearer failures and stronger traceability.

## AI Limitations

The AI could not inspect the real application, authentication flow, Admin configuration, API endpoint names, or actual network payload. It therefore could not verify selectors, status codes for invalid input, idempotency behavior, or how match-anywhere mode is enabled. Those areas are explicitly documented as assumptions and configuration points rather than presented as known facts.

The AI also cannot provide an official platform-exported conversation archive from inside the repository. I included the visible working transcript and prompt files, but I must attach or add the official complete JSON export required by the evaluator before final submission.
