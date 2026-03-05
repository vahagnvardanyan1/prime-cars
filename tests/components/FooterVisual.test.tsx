import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// Navigate to homepage and validate the footer
// Happy path test: Verify footer rendering

test.describe('Footer Component', () => {
  test('should render correctly with updated background colors', async ({ page }) => {
    await page.goto(BASE_URL);
    const footer = await page.locator('footer');
    await expect(footer).toHaveCSS('background-color', 'rgb(187, 222, 251)'); // Light mode color
    await page.evaluate(() => window.document.documentElement.classList.add('dark'));
    await expect(footer).toHaveCSS('background-color', 'rgb(30, 58, 138)'); // Dark mode color
  });

  // Visual checks across different resolutions
  test('should be responsive across breakpoints', async ({ page }) => {
    const sizes = [
      { width: 360, height: 640 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1280, height: 800 },  // Desktop
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto(BASE_URL);
      const footer = await page.locator('footer');
      await expect(footer).toBeVisible();
    }
  });

  // Check for no impact on adjacent components
  test('should not affect other components', async ({ page }) => {
    await page.goto(BASE_URL);
    const header = await page.locator('header');
    await expect(header).not.toHaveCSS('background-color', 'rgb(187, 222, 251)');
    await expect(header).not.toHaveCSS('background-color', 'rgb(30, 58, 138)');
  });
});
