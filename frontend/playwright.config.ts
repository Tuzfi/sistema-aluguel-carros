import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', workers: 1, timeout: 90000, expect: { timeout: 15000 },
  use: { baseURL: 'http://127.0.0.1:15173', viewport: { width: 1365, height: 900 }, trace: 'retain-on-failure' },
  webServer: [
    { command: 'node scripts/demo-server.mjs', url: 'http://127.0.0.1:18080/api/auth/csrf', timeout: 240000, reuseExistingServer: false,
      env: { VIACAR_DEMO_PASSWORD: 'DemoSomenteTeste123!', SERVER_PORT: '18080' } },
    { command: 'npm run dev -- --host 127.0.0.1 --strictPort --port 15173', url: 'http://127.0.0.1:15173/login', timeout: 60000, reuseExistingServer: false, env: { VIACAR_API_PROXY: 'http://127.0.0.1:18080' } },
  ],
});
