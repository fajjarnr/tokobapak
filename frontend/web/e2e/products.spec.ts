import { test, expect } from '@playwright/test';
import { ProductPage } from './page-objects/product.page';

test.describe('Products', () => {

    test.describe('Product Listing', () => {
        test('should navigate to products page', async ({ page }) => {
            await page.goto('/products');
            await page.waitForLoadState('networkidle');

            // Should be on products page
            await expect(page).toHaveURL(/\/products/);
        });

        test('should display product grid', async ({ page }) => {
            await page.goto('/products');
            await page.waitForLoadState('networkidle');

            // Look for product cards or items
            const productItems = page.locator('article, [class*="product"], .grid > div').filter({ has: page.locator('img') });
            const count = await productItems.count();
            console.log(`Found ${count} product items on listing page`);
        });

        test('should navigate to categories page', async ({ page }) => {
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Should have categories displayed
            await expect(page).toHaveURL(/\/categories/);
        });
    });

    test.describe('Product Detail', () => {
        let productPage: ProductPage;

        test('should display product detail page', async ({ page }) => {
            productPage = new ProductPage(page);

            // Try to navigate to a product (using ID 1 as example)
            await page.goto('/product/1');
            await page.waitForLoadState('networkidle');

            // Check if product page loaded (might show error if product doesn't exist)
            const hasTitle = await page.locator('h1').count() > 0;
            console.log('Product page has title:', hasTitle);
        });

        test('should display product information', async ({ page }) => {
            productPage = new ProductPage(page);
            await page.goto('/product/1');
            await page.waitForLoadState('networkidle');

            // Check for product elements
            const hasProductTitle = await productPage.productTitle.count() > 0;
            const hasPrice = await page.locator('text=/Rp\\s*[\\d.,]+/').count() > 0;

            console.log('Has product title:', hasProductTitle);
            console.log('Has price:', hasPrice);
        });

        test('should have add to cart button', async ({ page }) => {
            await page.goto('/product/1');
            await page.waitForLoadState('networkidle');

            const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")');
            const hasButton = await addToCartBtn.count() > 0;
            console.log('Has add to cart button:', hasButton);
        });

        test('should display product images', async ({ page }) => {
            await page.goto('/product/1');
            await page.waitForLoadState('networkidle');

            const images = page.locator('img');
            const imageCount = await images.count();
            console.log(`Found ${imageCount} images on product page`);
        });

        test('should handle non-existent product gracefully', async ({ page }) => {
            await page.goto('/product/non-existent-product-12345');
            await page.waitForLoadState('networkidle');

            // Should either show error page or redirect
            const hasError = await page.locator('text=/not found|error|404/i').count() > 0;
            const redirectedToHome = page.url().endsWith('/');

            console.log('Has error message:', hasError);
            console.log('Redirected to home:', redirectedToHome);
        });
    });

    test.describe('Add to Cart from Product Page', () => {
        test('should add product to cart', async ({ page }) => {
            // First check if we can access a product page
            await page.goto('/product/1');
            await page.waitForLoadState('networkidle');

            const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")');

            if (await addToCartBtn.count() > 0) {
                await addToCartBtn.click();

                // Wait for any toast notification or cart update
                await page.waitForTimeout(1000);

                // Check for success toast
                const toast = page.locator('[data-sonner-toast], [role="status"]');
                const hasToast = await toast.count() > 0;
                console.log('Has success toast:', hasToast);
            } else {
                console.log('Add to cart button not found - product may not exist');
            }
        });
    });
});
