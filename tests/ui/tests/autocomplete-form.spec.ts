import { test, expect } from '@playwright/test';
import { AutocompleteFormPage } from '../pages/AutocompleteFormPage.js';

const suggestions = [
  'agile methodology',
  'agile methodology process',
  'agile methodology process testing'
];

test.describe('Autocomplete form UI', () => {
  test('UI-001: Tab moves focus from input to Next button', async ({ page }) => {
    const form = new AutocompleteFormPage(page);
    await form.open();

    await page.keyboard.press('Tab');
    await expect(form.input).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(form.nextButton).toBeFocused();
  });

  test('UI-002: Enter submits a valid exact suggestion', async ({ page }) => {
    const form = new AutocompleteFormPage(page);
    await form.open();
    await form.typeValue('agile methodology');

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/responses') && response.request().method() === 'POST'
    );
    await form.submitByEnter();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    await expect(form.successMessage).toBeVisible();
    await expect(form.errorMessage).toBeHidden();
  });

  test('UI-003: Escape clears input and closes the suggestion list', async ({ page }) => {
    const form = new AutocompleteFormPage(page);
    await form.open();
    await form.typeValue('agile');

    await form.clearWithEscape();

    await expect(form.input).toHaveValue('');
    await expect(form.suggestions).toBeHidden();
  });

  test('UI-004: Prefix filtering keeps only suggestions beginning with typed text', async ({ page }) => {
    const form = new AutocompleteFormPage(page);
    await form.open('prefix');
    await form.typeValue('agile methodology p');

    await expect.poll(() => form.visibleSuggestionTexts()).toEqual([
      'agile methodology process',
      'agile methodology process testing'
    ]);
  });

  test('UI-005: Prefix filtering hides every suggestion when no prefix matches', async ({ page }) => {
    const form = new AutocompleteFormPage(page);
    await form.open('prefix');
    await form.typeValue('water');

    await expect.poll(() => form.visibleSuggestionTexts()).toEqual([]);
  });

  test('UI-006: Match-anywhere mode keeps substring matches', async ({ page }) => {
    const form = new AutocompleteFormPage(page);
    await form.open('anywhere');
    await form.typeValue('methodology process');

    await expect.poll(() => form.visibleSuggestionTexts()).toEqual([
      'agile methodology process',
      'agile methodology process testing'
    ]);
  });

  test('UI-007: Clicking a suggestion populates the input with its exact value', async ({ page }) => {
    const form = new AutocompleteFormPage(page);
    await form.open();
    await form.typeValue('agile methodology proc');

    await form.selectSuggestion('agile methodology process');

    await expect(form.input).toHaveValue('agile methodology process');
  });

  test('UI-008: Input accepts arbitrary user text before submission validation', async ({ page }) => {
  const form = new AutocompleteFormPage(page);
  await form.open();

  await form.typeValue('water management 123');

  await expect(form.input).toHaveValue('water management 123');
  await expect.poll(() => form.visibleSuggestionTexts()).toEqual([]);
  await expect(form.errorMessage).toBeHidden();
  await expect(form.successMessage).toBeHidden();
});

  test('UI-009: Valid submission shows success and sends the required core fields', async ({ page }) => {
    const form = new AutocompleteFormPage(page);
    await form.open();
    await form.selectSuggestion('agile methodology');

    const requestPromise = page.waitForRequest(
      request => request.url().includes('/api/responses') && request.method() === 'POST'
    );
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/responses') && response.request().method() === 'POST'
    );

    await form.submitByClick();
    const [request, response] = await Promise.all([requestPromise, responsePromise]);
    const payload = request.postDataJSON() as Record<string, unknown>;

    expect(response.status()).toBe(200);
    expect(payload).toMatchObject({
      account_id: '98765',
      account_email: 'test123@gmail.com',
      locale: 'en-IN',
      text: 'agile methodology',
      completed: true
    });
    expect(typeof payload.start_date).toBe('string');
    expect(typeof payload.end_date).toBe('string');
    expect(payload.suggestion_list).toBe(suggestions.join(', '));
    await expect(form.successMessage).toBeVisible();
  });

test('UI-010: Invalid free text shows an error and sends no persistence request', async ({ page }) => {
  const form = new AutocompleteFormPage(page);
  let submissionRequestCount = 0;

  page.on('request', request => {
    if (
      request.url().includes('/api/responses') &&
      request.method() === 'POST'
    ) {
      submissionRequestCount += 1;
    }
  });

  await form.open();
  await form.typeValue('not a configured suggestion');
  await form.submitByClick();

  await expect(form.errorMessage).toContainText('Invalid input');
  await expect(form.errorMessage).toBeVisible();
  await expect(form.successMessage).toBeHidden();
  expect(submissionRequestCount).toBe(0);
});
});
