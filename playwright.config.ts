import { defineConfig } from '@playwright/test';
const productionBrowserTest = process.env.PLAYWRIGHT_PRODUCTION === '1';
export default defineConfig({
  testDir: './tests/browser', workers: 1, timeout: 90000,
  use: { baseURL: 'http://127.0.0.1:3014', headless: true, channel: 'chrome' },
  webServer: {
    command: productionBrowserTest
      ? 'node node_modules/next/dist/bin/next start --port 3014'
      : 'node node_modules/next/dist/bin/next dev --port 3014',
    url: 'http://127.0.0.1:3014', timeout: 120000, reuseExistingServer: !process.env.CI,
    stdout: productionBrowserTest ? 'pipe' : 'ignore',
    env: { DATABASE_URL: '', CONVERSION_WORKER_URL: 'http://127.0.0.1:3015', ADMIN_SECRET_KEY: 'local-test-secret-at-least-32-characters' },
  },
});
