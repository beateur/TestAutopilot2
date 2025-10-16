import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour tests E2E sans serveurs web automatiques
 * Utilisez ce fichier avec: pnpm exec playwright test --config=playwright.e2e.config.ts
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Sequential to avoid data conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // No automatic webServer - assume they're running manually
  webServer: undefined,
});
