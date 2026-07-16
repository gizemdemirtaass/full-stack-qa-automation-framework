import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const slowMo = Number(process.env.PW_SLOW_MO ?? 0);

export default defineConfig({
  testDir: './ui-tests/specs',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }]
  ],
  use: {
    baseURL,
    launchOptions: { slowMo },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
  ],
  webServer: process.env.SKIP_WEB_SERVER
    ? undefined
    : {
        command: 'node app/server.js',
        url: `${baseURL}/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 15_000
      }
});
