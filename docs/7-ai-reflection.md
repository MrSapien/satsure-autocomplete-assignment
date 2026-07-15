# AI Usage Reflection

## Tools Used

I used ChatGPT during this assignment.

## Usage Areas

I used ChatGPT for:

* Breaking down the functional requirements into testable behaviours
* Drafting an initial risk-ranked test-scenario list
* Creating an initial Playwright project scaffold
* Drafting UI and API test cases
* Understanding Playwright configuration, Page Object Model, schema validation, and API semantic validation
* Troubleshooting Node.js, npm, TypeScript, Git, and local execution issues
* Reviewing the AI disclosure and transcript requirements

## Modifications Made

### 1. Corrected the suggestion-list discrepancy analysis

The initial interpretation risked treating the returned `suggestion_list` as incorrect simply because it contained all three configured suggestions.

I corrected this because all three supplied suggestions begin with `agile methodology`. Therefore, all three are valid matches under the prefix-matching requirement. I documented the phrase “not all suggestions” as a requirement ambiguity rather than reporting a false defect.

### 2. Corrected the locale interpretation

The generated analysis risked treating `en` as an invalid BCP 47 locale.

I corrected this because `en` is syntactically valid. The more precise concern is that `en-IN` better represents the supplied English-language environment in India.

### 3. Separated text-entry behaviour from submission validation

The initial UI suite indirectly tested arbitrary text entry only through an invalid-submission test.

I added a dedicated FR-01 test proving that arbitrary user text can be entered before validation. I then strengthened the invalid-submission test to verify that no persistence POST request is sent.

This improves requirement traceability because input capability and submission validity are separate behaviours.

### 4. Corrected the dependency and execution setup

The initial generated project did not install correctly in my local environment, and the TypeScript compiler was unavailable.

I reviewed the package configuration, installed the required local development dependencies, configured the npm registry, installed Playwright Chromium, and verified the project through TypeScript, API, and UI test execution.

## AI Limitations

The AI generated a large initial scaffold before verifying that every dependency and execution instruction worked in my Windows environment. The initial output therefore required local troubleshooting and manual correction.

The AI also could have reported incorrect defects if I had accepted its initial interpretations without checking the exact prefix-matching and BCP 47 requirements.

This demonstrated that AI-generated test artefacts must be reviewed against the source requirements, executed locally, and corrected using independent testing judgement.
