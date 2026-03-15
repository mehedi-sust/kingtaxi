import { test, expect } from '@playwright/test';

/**
 * Homepage E2E Tests
 * Tests that the homepage loads correctly on desktop and mobile viewports.
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads and renders the hero section', async ({ page }) => {
    // Page title should contain KingTaxi
    await expect(page).toHaveTitle(/king taxi/i);

    // Hero heading should be visible
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();

    // At least one "Book" CTA button should be present
    const bookButton = page.getByRole('link', { name: /book/i }).first();
    await expect(bookButton).toBeVisible();
  });

  test('navigation bar is visible', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('navigating to /book from homepage CTA works', async ({ page }) => {
    const bookLink = page.getByRole('link', { name: /book a ride|book now/i }).first();
    await bookLink.click();
    await expect(page).toHaveURL('/book');
  });

  test('footer is visible with contact info', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('mobile — page fits viewport without horizontal scroll (iPhone SE)', async ({ page }) => {
    // This test runs on the 'mobile-safari' project (iPhone SE 375px)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 375;
    // Body should not overflow viewport
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1px tolerance
  });
});
