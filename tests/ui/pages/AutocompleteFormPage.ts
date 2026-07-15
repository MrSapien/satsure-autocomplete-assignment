import { expect, type Locator, type Page } from '@playwright/test';
import { environment } from '../config/environment.js';

export class AutocompleteFormPage {
  readonly page: Page;
  readonly input: Locator;
  readonly suggestions: Locator;
  readonly suggestionItems: Locator;
  readonly nextButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.input = page.locator('#input-field');
    this.suggestions = page.locator('ul.suggestions');
    this.suggestionItems = this.suggestions.locator('li');
    this.nextButton = page.locator('#next-button');
    this.errorMessage = page.locator('.error-message');
    this.successMessage = page.locator('.success-container');
  }

  async open(matchMode: 'prefix' | 'anywhere' = 'prefix'): Promise<void> {
    const query = matchMode === 'anywhere' ? '?mode=anywhere' : '';
    await this.page.goto(`${environment.formPath}${query}`);
    await expect(this.input).toBeVisible();
  }

  async typeValue(value: string): Promise<void> {
    await this.input.fill(value);
  }

  async selectSuggestion(text: string): Promise<void> {
    await this.suggestionItems.filter({ hasText: text }).getByText(text, { exact: true }).click();
  }

  async visibleSuggestionTexts(): Promise<string[]> {
    const visibleItems = this.suggestionItems.filter({ visible: true });
    return visibleItems.allTextContents();
  }

  async submitByClick(): Promise<void> {
    await this.nextButton.click();
  }

  async submitByEnter(): Promise<void> {
    await this.input.press('Enter');
  }

  async clearWithEscape(): Promise<void> {
    await this.input.press('Escape');
  }
}
