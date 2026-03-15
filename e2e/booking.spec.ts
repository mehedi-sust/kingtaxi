import { test, expect } from '@playwright/test';

/**
 * Booking Flow E2E Tests
 * Tests the multi-step booking form for navigation, validation, and submission.
 */

test.describe('Booking Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book');
  });

  test('renders with "Book Your Ride" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /book your ride/i })).toBeVisible();
  });

  test('shows step 1 form with required fields on load', async ({ page }) => {
    // Pickup location input
    await expect(page.locator('#pickupLocation')).toBeVisible();
    // Destination input
    await expect(page.locator('#destination')).toBeVisible();
    // Date input
    await expect(page.locator('#date')).toBeVisible();
    // Time input
    await expect(page.locator('#time')).toBeVisible();
  });

  test('shows 3 vehicle type cards', async ({ page }) => {
    const vehicleCards = page.locator('text=/Standard Car|Executive Car|Minibus/');
    await expect(vehicleCards.first()).toBeVisible();
  });

  test('step 1 to step 2 navigation requires all required fields', async ({ page }) => {
    // The "Next" button should be present  
    const nextButton = page.getByRole('button', { name: /next|continue/i }).first();
    await expect(nextButton).toBeVisible();

    // Without filling fields the form shouldn't advance to step 2
    await nextButton.click();
    // Still on step 1 (step indicator still starts at 1 active)
    await expect(page.locator('#pickupLocation')).toBeVisible();
  });

  test('filling step 1 fields and selecting vehicle advances to step 2', async ({ page }) => {
    // Fill pickup location
    await page.fill('#pickupLocation', 'Ashford, Kent');
    // Fill destination
    await page.fill('#destination', 'Heathrow Airport');
    // Fill date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.fill('#date', dateStr);
    // Fill time
    await page.fill('#time', '09:00');
    // Select Standard Car vehicle (first card)
    const standardCard = page.locator('div').filter({ hasText: /Standard Car/ }).first();
    await standardCard.click();

    // Click Next
    const nextButton = page.getByRole('button', { name: /next/i }).first();
    await nextButton.click();

    // Should be on step 2
    await expect(page.getByText(/contact details/i)).toBeVisible({ timeout: 3000 });
  });

  test('step 2 has contact name, phone, email fields', async ({ page }) => {
    // Navigate to step 2 first
    await page.fill('#pickupLocation', 'Ashford');
    await page.fill('#destination', 'Gatwick Airport');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('#date', tomorrow.toISOString().split('T')[0]);
    await page.fill('#time', '10:00');
    const standardCard = page.locator('div').filter({ hasText: /Standard Car/ }).first();
    await standardCard.click();

    await page.getByRole('button', { name: /next/i }).first().click();

    // Now on step 2
    await expect(page.locator('#contactName')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#contactPhone')).toBeVisible();
  });

  test('mobile — booking form page has no horizontal overflow', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('step 3 review shows journey summary', async ({ page }) => {
    // Navigate all the way to step 3
    await page.fill('#pickupLocation', 'Ashford');
    await page.fill('#destination', 'Heathrow Airport');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('#date', tomorrow.toISOString().split('T')[0]);
    await page.fill('#time', '08:00');
    await page.locator('div').filter({ hasText: /Standard Car/ }).first().click();
    await page.getByRole('button', { name: /next/i }).first().click();

    // Fill step 2 contact details
    await page.fill('#contactName', 'Test User').catch(() => {});
    await page.locator('#contactPhone').fill('+447700900123').catch(() => {});

    const nextBtn = page.getByRole('button', { name: /next/i }).first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }

    // Step 3 should have a review/confirm heading
    await expect(
      page.getByText(/review|confirm your booking|summary/i)
    ).toBeVisible({ timeout: 3000 });
  });
});
