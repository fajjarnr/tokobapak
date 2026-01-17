import { test, expect } from '@playwright/test';

test('Sanity Check: Register and Login Flow', async ({ page }) => {
    const email = `e2e_${Date.now()}@example.com`;
    const name = `E2E User`;
    const password = 'password123';

    console.log(`Testing registration with ${email}`);

    // 1. Go to Register
    await page.goto('/register');
    await expect(page.locator('h1, h2, [data-testid="register-title"]')).toBeVisible();

    // 2. Fill Form
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);

    // 3. Submit
    await page.click('button[type="submit"]');

    // 4. Assert Redirect to Home (assuming auto-login implemented)
    // Wait for URL to be root. Timeout 10s.
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // 5. Verify User Logged In (check for profile icon or logout button)
    // Assuming Header has a user menu or avatar when logged in.
    // Or check localStorage
    const token = await page.evaluate(() => {
        const auth = localStorage.getItem('auth-storage');
        return auth ? JSON.parse(auth).state.token : null;
    });
    expect(token).toBeTruthy();

    console.log('Registration and Auto-Login successful');
});
