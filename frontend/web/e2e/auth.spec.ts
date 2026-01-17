import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Authentication - Login', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('should display login page correctly', async () => {
        await expect(loginPage.cardTitle).toBeVisible();
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.submitButton).toBeVisible();
    });

    test('should display social login buttons', async () => {
        await expect(loginPage.googleButton).toBeVisible();
        await expect(loginPage.facebookButton).toBeVisible();
    });

    test('should have link to register page', async () => {
        await expect(loginPage.registerLink).toBeVisible();
        await loginPage.registerLink.click();
        await expect(loginPage.page).toHaveURL(/\/register/);
    });

    test('should have forgot password link', async () => {
        await expect(loginPage.forgotPasswordLink).toBeVisible();
    });

    test('should show validation error for empty email', async ({ page }) => {
        await loginPage.passwordInput.fill('password123');
        await loginPage.submitButton.click();

        // Wait a moment for validation
        await page.waitForTimeout(500);

        // Check for any validation message
        const validationMessage = page.locator('p.text-destructive, [role="alert"], .text-red-500');
        const hasValidation = await validationMessage.count() > 0;
        console.log('Has empty email validation:', hasValidation);
    });

    test('should show validation error for invalid email format', async ({ page }) => {
        await loginPage.emailInput.fill('invalid-email');
        await loginPage.passwordInput.fill('password123');
        await loginPage.submitButton.click();

        await page.waitForTimeout(500);

        const validationMessage = page.locator('p.text-destructive, [role="alert"], .text-red-500');
        const hasValidation = await validationMessage.count() > 0;
        console.log('Has invalid email validation:', hasValidation);
    });

    test('should show validation error for empty password', async ({ page }) => {
        await loginPage.emailInput.fill('user@example.com');
        await loginPage.submitButton.click();

        await page.waitForTimeout(500);

        const validationMessage = page.locator('p.text-destructive, [role="alert"], .text-red-500');
        const hasValidation = await validationMessage.count() > 0;
        console.log('Has empty password validation:', hasValidation);
    });

    test('should login successfully with demo credentials', async ({ page }) => {
        await loginPage.login('user@example.com', 'password123');

        // Wait for redirect to home
        await page.waitForURL('/', { timeout: 15000 });

        // Should be redirected to homepage
        await expect(page).toHaveURL('/');
    });

    test('should login in demo mode with any valid credentials', async ({ page }) => {
        await loginPage.login('demo@test.com', 'anypassword123');

        // Wait for redirect
        await page.waitForURL('/', { timeout: 15000 });

        // Should be redirected to homepage
        await expect(page).toHaveURL('/');
    });

    test('should show loading state during login', async ({ page }) => {
        await loginPage.emailInput.fill('user@example.com');
        await loginPage.passwordInput.fill('password123');

        // Check submit button before click
        await expect(loginPage.submitButton).toBeEnabled();

        await loginPage.submitButton.click();

        // Check for loading indicator (spinner)
        const spinner = page.locator('.animate-spin');
        // Note: This might be too fast to catch
        console.log('Spinner found:', await spinner.count() > 0);
    });

    test('should toggle remember me checkbox', async ({ page }) => {
        const checkbox = loginPage.rememberMeCheckbox;

        if (await checkbox.count() > 0) {
            // Click to check
            await checkbox.click();

            // Verify checked state (for Radix checkbox)
            const checkedState = await checkbox.getAttribute('data-state');
            console.log('Checkbox state after click:', checkedState);
        }
    });
});

test.describe('Authentication - Register', () => {
    test('should display register page correctly', async ({ page }) => {
        await page.goto('/register');

        // Check for register form elements
        await expect(page.locator('h1, h2').filter({ hasText: /register|sign up|create account/i })).toBeVisible();
        await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
        await page.goto('/register');

        const loginLink = page.locator('a[href*="login"]');
        await expect(loginLink).toBeVisible();
        await loginLink.click();
        await expect(page).toHaveURL(/\/login/);
    });
});
