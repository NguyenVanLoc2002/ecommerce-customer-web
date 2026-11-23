import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4174';
const apiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:8080/api/v1';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'issue-28-order-hold.spec.ts',
  fullyParallel: false,
  forbidOnly: true,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4174',
    url: baseURL,
    reuseExistingServer: false,
    env: {
      ...process.env,
      VITE_API_BASE_URL: apiBaseUrl,
      VITE_E2E: 'true',
      VITE_SITE_URL: baseURL,
      VITE_USE_MOCK_DATA: 'false',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
