import type { FullConfig } from '@playwright/test';

import { verifyHarnessIdentity } from './harness-server';

/**
 * Refuses to run the suite against a harness that serves another checkout.
 * Playwright starts (or reuses) the web server before global setup runs.
 */
export default async function globalSetup(
  config: Pick<FullConfig, 'webServer'>
): Promise<void> {
  const url = config.webServer?.url;
  if (!url)
    throw new Error('playwright.config.ts must configure webServer.url.');
  await verifyHarnessIdentity(new URL(url).origin);
}
