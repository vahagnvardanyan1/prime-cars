const { test, expect } = require('@playwright/test');

// Array of browser types to test
const browsers = ['chromium', 'firefox', 'webkit'];

browsers.forEach((browserType) => {
  test.describe(`Footer background tests on ${browserType}`, () => {
    let browser;

    test.beforeAll(async () => {
      browser = await playwright[browserType].launch();
    });

    test.afterAll(async () => {
      await browser.close();
    });

    const viewports = [
      { width: 1920, height: 1080, description: 'desktop' },
      { width: 768, height: 1024, description: 'tablet' },
      { width: 375, height: 667, description: 'mobile' },
    ];

    viewports.forEach(({width, height, description}) => {
      test(`should display correct footer background on ${description} viewport`, async () => {
        const context = await browser.newContext({ viewport: { width, height } });
        const page = await context.newPage();
        await page.goto('http://localhost:3000'); // Update with actual URL

        const footer = await page.$('footer');
        const backgroundColor = await footer.evaluate(node => getComputedStyle(node).backgroundColor);

        expect(backgroundColor).toBe('rgba(0, 0, 0, 1)'); // Update with expected color value
      });
    });

    test('should not affect other parts of the website', async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('http://localhost:3000'); // Update with actual URL

      // Verify that no unexpected changes occurred in other components
      const header = await page.$('header');
      const headerBackgroundColor = await header.evaluate(node => getComputedStyle(node).backgroundColor);

      expect(headerBackgroundColor).not.toBe('rgba(0, 0, 0, 1)'); // Assuming the header should have a different color
    });
  });
});
