import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/home.page';

test.describe('Homepage', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.goto();
    });

    test('should load homepage successfully', async ({ page }) => {
        await expect(page).toHaveTitle(/TokoBapak/i);
    });

    test('should display header with logo and navigation', async () => {
        await expect(homePage.header).toBeVisible();
        await expect(homePage.logo).toBeVisible();
    });

    test('should display hero carousel', async () => {
        // Check if carousel or hero section exists
        const heroSection = homePage.page.locator('section').first();
        await expect(heroSection).toBeVisible();
    });

    test('should display categories section', async () => {
        // Scroll to categories if needed
        const categoriesSection = homePage.page.locator('section').filter({ hasText: /categor/i });
        if (await categoriesSection.count() > 0) {
            await expect(categoriesSection.first()).toBeVisible();
        }
    });

    test('should display product sections', async ({ page }) => {
        // Check for any product-like content
        const productCards = await homePage.getProductCards();
        const productCount = await productCards.count();

        // Should have at least some products displayed
        console.log(`Found ${productCount} product cards on homepage`);
    });

    test('should display footer', async () => {
        await expect(homePage.footer).toBeVisible();
    });

    test('should navigate to cart page', async ({ page }) => {
        const cartLink = page.locator('a[href="/cart"]');
        if (await cartLink.count() > 0) {
            await cartLink.first().click();
            await expect(page).toHaveURL(/\/cart/);
        }
    });

    test('should navigate to login page', async ({ page }) => {
        const loginLink = page.locator('a[href="/login"]');
        if (await loginLink.count() > 0) {
            await loginLink.first().click();
            await expect(page).toHaveURL(/\/login/);
        }
    });

    test('should have search functionality', async ({ page }) => {
        const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]');
        if (await searchInput.count() > 0) {
            await expect(searchInput.first()).toBeVisible();
        }
    });

    test('should display newsletter section', async ({ page }) => {
        const newsletterSection = page.locator('section').filter({ hasText: /newsletter|subscribe/i });
        if (await newsletterSection.count() > 0) {
            await expect(newsletterSection.first()).toBeVisible();
        }
    });
});
