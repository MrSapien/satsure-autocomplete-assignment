import { defineConfig, devices } from '@playwright/test';

const usingLocalMock = !process.env.TARGET_BASE_URL && !process.env.API_BASE_URL;
const uiBaseURL = process.env.TARGET_BASE_URL ?? 'http://127.0.0.1:4173';
const apiBaseURLValue = process.env.API_BASE_URL ?? 'http://127.0.0.1:4173/api';
const apiBaseURL = apiBaseURLValue.endsWith('/') ? apiBaseURLValue : `${apiBaseURLValue}/`;
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: chromiumExecutablePath ? 'off' : 'retain-on-failure'
  },
  webServer: usingLocalMock
    ? {
        command: 'node scripts/mock-server.cjs',
        url: 'http://127.0.0.1:4173/health',
        reuseExistingServer: true,
        timeout: 15_000
      }
    : undefined,
  projects: [
    {
      name: 'ui-chromium',
      testMatch: /tests\/ui\/tests\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: uiBaseURL,
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata',
        launchOptions: chromiumExecutablePath
          ? { executablePath: chromiumExecutablePath }
          : undefined
      }
    },
    {
      name: 'api',
      testMatch: /tests\/api\/tests\/.*\.spec\.ts/,
      use: {
        baseURL: apiBaseURL,
        extraHTTPHeaders: process.env.API_BEARER_TOKEN
          ? { Authorization: `Bearer ${process.env.API_BEARER_TOKEN}` }
          : undefined
      }
    }
  ]
});
