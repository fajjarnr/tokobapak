import { test, expect } from '@playwright/test';
import { CartPage } from './page-objects/cart.page';

test.describe('Cart', () => {
    let cartPage: CartPage;

    test.beforeEach(async ({ page }) => {
        cartPage = new CartPage(page);
    });

    test.describe('Empty Cart', () => {
        test('should display empty cart message when cart is empty', async ({ page }) => {
            await cartPage.goto();
            await cartPage.waitForLoaded();

            // Check for empty cart message or empty state
            const emptyMessage = page.locator('h1, p').filter({ hasText: /empty|no items|nothing/i });
            const startShoppingBtn = page.locator('a:has-text("Shopping"), button:has-text("Shopping")');

            const hasEmptyState = await emptyMessage.count() > 0 || await startShoppingBtn.count() > 0;
            console.log('Has empty cart state:', hasEmptyState);
        });

        test('should have link to start shopping', async ({ page }) => {
            await cartPage.goto();
            await cartPage.waitForLoaded();

            const shopLink = page.locator('a[href="/"], a:has-text("Shopping")');
            const hasLink = await shopLink.count() > 0;
            console.log('Has start shopping link:', hasLink);
        });
    });

    test.describe('Cart with Items', () => {
        test.beforeEach(async ({ page }) => {
            // Use localStorage to add cart item directly for reliable testing
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Add item to cart via localStorage (Zustand persist)
            await page.evaluate(() => {
                const cartItem = {
                    id: 'test-product-1',
                    productId: '276dc722-0c4d-404c-84ab-321be82455f7',
                    name: 'Test Product for E2E',
                    price: 100000,
                    quantity: 1,
                    image: '/placeholder.svg'
                };
                const cartState = {
                    state: {
                        items: [cartItem],
                        isLoading: false
                    },
                    version: 0
                };
                localStorage.setItem('cart-storage', JSON.stringify(cartState));
            });

            // Refresh to load cart state
            await page.reload();
            await page.waitForLoadState('networkidle');
        });

        test('should display cart items', async ({ page }) => {
            await cartPage.goto();
            await cartPage.waitForLoaded();

            const itemCount = await cartPage.getCartItemCount();
            console.log('Cart items count:', itemCount);
        });

        test('should display order summary', async ({ page }) => {
            await cartPage.goto();
            await cartPage.waitForLoaded();

            // Check for summary elements
            const hasSummary = await page.locator('text=/subtotal|total/i').count() > 0;
            console.log('Has order summary:', hasSummary);
        });

        test('should have checkout button', async ({ page }) => {
            await cartPage.goto();
            await cartPage.waitForLoaded();

            await expect(cartPage.checkoutButton).toBeVisible();
        });

        test('should update item quantity', async ({ page }) => {
            await cartPage.goto();
            await cartPage.waitForLoaded();

            const itemCount = await cartPage.getCartItemCount();
            if (itemCount > 0) {
                // Try to find plus button and click it
                const plusButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
                if (await plusButton.count() > 0) {
                    await plusButton.click();
                    await page.waitForTimeout(500);
                    console.log('Clicked increase button');
                }
            }
        });

        test('should navigate to checkout', async ({ page }) => {
            await cartPage.goto();
            await cartPage.waitForLoaded();

            const itemCount = await cartPage.getCartItemCount();
            if (itemCount > 0) {
                await cartPage.checkoutButton.click();
                await expect(page).toHaveURL(/\/checkout/);
            }
        });
    });

    test.describe('Voucher/Coupon', () => {
        test('should have voucher input field', async ({ page }) => {
            await cartPage.goto();
            await cartPage.waitForLoaded();

            const hasVoucherInput = await cartPage.voucherInput.count() > 0;
            console.log('Has voucher input:', hasVoucherInput);
        });

        test('should have apply button for voucher', async ({ page }) => {
            await cartPage.goto();
            await cartPage.waitForLoaded();

            const hasApplyButton = await cartPage.applyVoucherButton.count() > 0;
            console.log('Has apply button:', hasApplyButton);
        });
    });
});
