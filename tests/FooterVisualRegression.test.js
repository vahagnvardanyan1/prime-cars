import { test, expect } from '@playwright/test';
test.describe('Footer visual regression', () => {
  test('should have correct background color across browsers and screen sizes', async ({ page }) => {
    await page.goto('/'); // assuming root loads the footer section
    const footer = await page.$('footer');

    // Check background color on desktop (default)
    let bgColor = await footer.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(240, 244, 248)');

    // Check for dark mode settings
    await page.emulateMedia({ colorScheme: 'dark' });
    bgColor = await footer.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(11, 15, 20)');

    // Check on mobile
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X resolution
    bgColor = await footer.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(240, 244, 248)');

    // Check on tablet in dark mode
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad resolution
    await page.emulateMedia({ colorScheme: 'dark' });
    bgColor = await footer.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(11, 15, 20)');
  });
});