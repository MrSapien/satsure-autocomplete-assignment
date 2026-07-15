## Local Execution and UI Test Improvements

I executed the TypeScript, API, and UI suites on my Windows environment.

During review, I identified that arbitrary text entry and invalid submission
were being covered by the same test. I separated these concerns by adding a
dedicated FR-01 test that verifies arbitrary text can be entered before
validation.

I also strengthened the invalid-submission test by monitoring network traffic
and verifying that invalid text does not produce a POST request to the
persistence endpoint.

This connects the tests more clearly to the requirements:

- FR-01 verifies input capability.
- FR-04 verifies validation and persistence behaviour.

Local verification completed:

- TypeScript type checking passed.
- API automation tests passed.
- UI automation tests passed.
- The modified suite executed successfully on my Windows environment.