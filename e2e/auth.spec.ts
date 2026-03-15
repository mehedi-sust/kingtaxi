import { test, expect } from '@playwright/test';

/**
 * Authentication Flow E2E Tests
 * Tests sign in, sign up forms and their validation.
 */

test.describe('Sign In Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signin');
  });

  test('renders the sign in form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome back|sign in/i })).toBeVisible();
    await expect(page.locator('#emailOrPhone')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.fill('#emailOrPhone', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show an error message (either from server or network)
    const errorEl = page.locator('[class*="bg-red-50"], [class*="text-red-"]').first();
    await expect(errorEl).toBeVisible({ timeout: 8000 });
  });

  test('password visibility toggle works', async ({ page }) => {
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye icon button
    const toggleBtn = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first();
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('has a link to the sign up page', async ({ page }) => {
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();
    await expect(page).toHaveURL('/signup');
  });

  test('mobile — sign in page fits viewport', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});

test.describe('Sign Up Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('renders the sign up form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /create|join|sign up|register/i })).toBeVisible();
  });

  test('has a link back to sign in', async ({ page }) => {
    const signInLink = page.getByRole('link', { name: /sign in|log in/i }).first();
    await expect(signInLink).toBeVisible();
  });

  test('mobile — sign up page fits viewport', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});

test.describe('Driver Application Page', () => {
  test('renders the driver application form', async ({ page }) => {
    await page.goto('/driver-application');
    await expect(page.getByRole('heading', { name: /driver|apply|application/i })).toBeVisible();
  });
});
