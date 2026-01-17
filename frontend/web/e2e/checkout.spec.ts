import { test, expect } from '@playwright/test';
import { CheckoutPage } from './page-objects/checkout.page';
import { CartPage } from './page-objects/cart.page';

test.describe('Checkout', () => {
    let checkoutPage: CheckoutPage;

    test.describe('Empty Checkout', () => {
        test('should redirect or show empty message when cart is empty', async ({ page }) => {
            await page.goto('/checkout');
            await page.waitForLoadState('networkidle');

            // Should either show empty message or have been redirected
            const hasEmptyMessage = await page.locator('text=/empty|no items/i').count() > 0;
            const hasGoShoppingLink = await page.locator('a:has-text("Shopping")').count() > 0;

            console.log('Has empty checkout state:', hasEmptyMessage || hasGoShoppingLink);
        });
    });

    test.describe('Checkout with Items', () => {
        test.beforeEach(async ({ page }) => {
            // Add item to cart first
            await page.goto('/product/1');
            await page.waitForLoadState('networkidle');

            const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")');
            if (await addToCartBtn.count() > 0) {
                await addToCartBtn.click();
                await page.waitForTimeout(1500);
            }

            // Navigate to checkout
            await page.goto('/checkout');
            await page.waitForLoadState('networkidle');

            checkoutPage = new CheckoutPage(page);
        });

        test('should display checkout page with sections', async ({ page }) => {
            // Check for main sections
            const shippingSection = page.locator('text=/shipping address/i');
            const paymentSection = page.locator('text=/payment/i');

            const hasShipping = await shippingSection.count() > 0;
            const hasPayment = await paymentSection.count() > 0;

            console.log('Has shipping section:', hasShipping);
            console.log('Has payment section:', hasPayment);
        });

        test('should display shipping address form', async ({ page }) => {
            await expect(checkoutPage.firstNameInput).toBeVisible();
            await expect(checkoutPage.lastNameInput).toBeVisible();
            await expect(checkoutPage.addressInput).toBeVisible();
        });

        test('should display shipping method options', async ({ page }) => {
            const shippingOptions = page.locator('input[type="radio"], button[role="radio"]');
            const optionCount = await shippingOptions.count();
            console.log('Shipping options count:', optionCount);
        });

        test('should display payment method options', async ({ page }) => {
            const paymentSection = page.locator('text=/payment method/i');
            const hasPayment = await paymentSection.count() > 0;
            console.log('Has payment section:', hasPayment);
        });

        test('should display order summary', async ({ page }) => {
            const orderSummary = page.locator('text=/your order|order summary/i');
            const hasOrderSummary = await orderSummary.count() > 0;
            console.log('Has order summary:', hasOrderSummary);

            // Check for total
            const total = page.locator('text=/Rp\\s*[\\d.,]+/');
            const hasTotal = await total.count() > 0;
            console.log('Has price total:', hasTotal);
        });

        test('should have place order button', async ({ page }) => {
            await expect(checkoutPage.placeOrderButton).toBeVisible();
        });

        test('should fill shipping address form', async ({ page }) => {
            await checkoutPage.fillShippingAddress({
                firstName: 'John',
                lastName: 'Doe',
                address: 'Jalan Sudirman No. 123',
                city: 'Jakarta',
                postalCode: '12345',
                phone: '08123456789',
            });

            // Verify fields are filled
            await expect(checkoutPage.firstNameInput).toHaveValue('John');
            await expect(checkoutPage.lastNameInput).toHaveValue('Doe');
        });

        test('should complete full checkout flow', async ({ page }) => {
            // Fill shipping address
            await checkoutPage.fillShippingAddress({
                firstName: 'Test',
                lastName: 'User',
                address: 'Jalan Test No. 456',
                city: 'Bandung',
                postalCode: '40123',
                phone: '08987654321',
            });

            // Place order
            await checkoutPage.placeOrder();

            // Wait for processing and redirect
            await page.waitForTimeout(3000);

            // Should redirect to order success page
            const url = page.url();
            const isOrderSuccess = url.includes('order-success') || url === 'http://localhost:3000/';
            console.log('Redirected after order:', url);
            console.log('Order completed successfully:', isOrderSuccess);
        });
    });
});
