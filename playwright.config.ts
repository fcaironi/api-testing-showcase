import { defineConfig } from '@playwright/test';

const useMock = process.env.USE_MOCK === '1';
const MOCK_PORT = 4010;

// Tests read the target from API_BASE_URL. Default: the public JSONPlaceholder API,
// or the local mock when USE_MOCK=1 (deterministic, offline, ideal for CI).
process.env.API_BASE_URL ??= useMock ? `http://127.0.0.1:${MOCK_PORT}` : 'https://jsonplaceholder.typicode.com';

// Keeps the machine name out of the report, which is meant to be shared.
process.env.ALLURE_HOST_NAME ??= process.env.CI ? 'ci' : 'local';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    [
      'allure-playwright',
      {
        // Only test.step and attachments reach the report: one step per HTTP call, no framework noise.
        detail: false,
        environmentInfo: {
          'API base URL': process.env.API_BASE_URL,
          Target: useMock ? 'local mock' : 'live API',
          Node: process.version,
        },
      },
    ],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  webServer: useMock
    ? {
        command: 'npx tsx mock/server.ts',
        url: `http://127.0.0.1:${MOCK_PORT}/posts/1`,
        reuseExistingServer: !process.env.CI,
        env: { PORT: String(MOCK_PORT) },
      }
    : undefined,
});
