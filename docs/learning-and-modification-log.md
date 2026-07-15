## UI Test Improvements and Local Verification

I separated FR-01 text-entry behaviour from FR-04 submission validation.

Changes made:

- Added a dedicated UI test confirming that arbitrary text can be entered before validation.
- Strengthened the invalid-input test to verify that no persistence POST request is sent.
- Updated requirement analysis and detailed test cases to reflect this distinction.

Local verification completed:

- TypeScript type checking passed.
- API automation tests passed.
- UI automation tests passed.
- The modified suite executed successfully on my Windows environment.