import { test, expect } from '@playwright/test';
import { validateAutocompleteResponse } from '../helpers/contract-validator.js';
import { matchingSuggestions, parseSuggestionList } from '../helpers/suggestion-matcher.js';
import { allSuggestions, providedResponse, validResponse } from '../fixtures/payloads.js';

const responsePath = normalizeApiPath(process.env.API_RESPONSE_PATH ?? '/responses/seed-valid');
const submissionPath = normalizeApiPath(process.env.API_SUBMISSION_PATH ?? '/responses');

function normalizeApiPath(value: string): string {
  return value.replace(/^\/+/, '');
}

test.describe('Autocomplete response API contract', () => {
  test('API-001: GET response matches FR-05 schema and data types', async ({ request }) => {
    const response = await request.get(responsePath);
    expect(response.status()).toBe(200);

    const payload = await response.json();
    const result = validateAutocompleteResponse(payload);

    expect(result.errors, JSON.stringify(result.errors, null, 2)).toEqual([]);
    expect(result.valid).toBe(true);
    expect(typeof payload.completed).toBe('boolean');
  });

  test('API-002: Locale is valid BCP 47 and reflects English-India environment', async ({ request }) => {
    const response = await request.get(responsePath);
    const payload = await response.json();
    const result = validateAutocompleteResponse(payload);

    expect(result.valid).toBe(true);
    expect(payload.locale).toBe('en-IN');
  });

  test('API-003: Timestamps are local IST values and end_date is not before start_date', async ({ request }) => {
    const response = await request.get(responsePath);
    const payload = await response.json();

    expect(payload.start_date).toMatch(/\+05:30$/);
    expect(payload.end_date).toMatch(/\+05:30$/);
    expect(Date.parse(payload.end_date)).toBeGreaterThanOrEqual(Date.parse(payload.start_date));
  });

  test('API-004: suggestion_list contains exactly the suggestions matching the persisted text', async ({ request }) => {
    const response = await request.get(responsePath);
    const payload = await response.json();

    const actual = parseSuggestionList(payload.suggestion_list);
    const expected = matchingSuggestions(payload.text, allSuggestions, 'prefix');

    expect(actual).toEqual(expected);
  });

  test('API-005: The response supplied in the assignment fails the strict FR-05 validation', async () => {
    const result = validateAutocompleteResponse(providedResponse);

    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.instancePath === '/completed')).toBe(true);
    expect(result.errors.some(error => error.instancePath === '/start_date')).toBe(true);
    expect(result.errors.some(error => error.instancePath === '/end_date')).toBe(true);
  });

  test('API-006 negative: Missing required account_email is rejected', async ({ request }) => {
    const { account_email: _removed, ...missingEmail } = validResponse;
    const response = await request.post(submissionPath, { data: missingEmail });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining('account_email') });
  });

  test('API-007 negative: String completed value is rejected', async ({ request }) => {
    const response = await request.post(submissionPath, {
      data: { ...validResponse, account_id: 'invalid-type', completed: 'true' }
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining('completed') });
  });

  test('API-008 negative: Invalid BCP 47 locale is rejected', async ({ request }) => {
    const response = await request.post(submissionPath, {
      data: { ...validResponse, account_id: 'invalid-locale', locale: 'english_India' }
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining('locale') });
  });
});
