import { test, expect } from '@playwright/test';
test.describe('Footer Component Visual Regression', () => {
  test('should render footer with correct background across various viewports and themes', async ({ page }) => {
    const viewports = [
      { width: 1280, height: 720 },  // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },  // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Test in Light Mode
      await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: 'light' },
      ]);
      await page.goto('/');
      const footerLight = await page.locator('footer');
      await expect(footerLight).toHaveClass(/bg-blue-900/);

      // Test in Dark Mode
      await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: 'dark' },
      ]);
      await page.goto('/');
      const footerDark = await page.locator('footer');
      await expect(footerDark).toHaveClass(/bg-blue-800/);
    }
  });
});