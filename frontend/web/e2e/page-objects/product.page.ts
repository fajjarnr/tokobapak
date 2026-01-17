import { Page, Locator } from '@playwright/test';

export class ProductPage {
    readonly page: Page;

    // Product Info
    readonly productTitle: Locator;
    readonly productPrice: Locator;
    readonly productDescription: Locator;
    readonly productImages: Locator;
    readonly mainImage: Locator;
    readonly thumbnails: Locator;

    // Variants
    readonly variantOptions: Locator;

    // Quantity
    readonly quantityInput: Locator;
    readonly increaseButton: Locator;
    readonly decreaseButton: Locator;

    // Actions
    readonly addToCartButton: Locator;
    readonly buyNowButton: Locator;
    readonly wishlistButton: Locator;

    // Reviews
    readonly reviewsSection: Locator;
    readonly reviewsList: Locator;
    readonly rating: Locator;

    // Related
    readonly relatedProducts: Locator;

    // Loading
    readonly loadingSpinner: Locator;

    constructor(page: Page) {
        this.page = page;

        // Product Info
        this.productTitle = page.locator('h1').first();
        this.productPrice = page.locator('[data-testid="product-price"]').or(page.locator('.text-2xl.font-bold, .text-3xl.font-bold').filter({ hasText: /Rp|IDR/ }));
        this.productDescription = page.locator('[data-testid="product-description"]').or(page.locator('p').filter({ hasText: /.{50,}/ }).first());
        this.productImages = page.locator('[data-testid="product-images"]').or(page.locator('.aspect-square, .aspect-video').filter({ has: page.locator('img') }));
        this.mainImage = page.locator('[data-testid="main-image"]').or(page.locator('.aspect-square img').first());
        this.thumbnails = page.locator('[data-testid="thumbnail"]').or(page.locator('.grid img, .flex img'));

        // Variants
        this.variantOptions = page.locator('[data-testid="variant-option"]').or(page.locator('button[data-state], [role="radio"]'));

        // Quantity
        this.quantityInput = page.locator('input[type="number"]').or(page.locator('span.w-12, span.w-8').filter({ hasText: /\d+/ }));
        this.increaseButton = page.locator('button:has([class*="plus"])').or(page.locator('button').filter({ has: page.locator('svg path[d*="plus" i], svg[class*="plus" i]') })).first();
        this.decreaseButton = page.locator('button:has([class*="minus"])').or(page.locator('button').filter({ has: page.locator('svg path[d*="minus" i], svg[class*="minus" i]') })).first();

        // Actions
        this.addToCartButton = page.locator('button:has-text("Add to Cart")').or(page.locator('button:has-text("Add to Bag")'));
        this.buyNowButton = page.locator('button:has-text("Buy Now")');
        this.wishlistButton = page.locator('button:has([class*="heart"])').or(page.locator('[aria-label*="wishlist" i]'));

        // Reviews
        this.reviewsSection = page.locator('[data-testid="reviews-section"]').or(page.locator('section').filter({ hasText: /review/i }));
        this.reviewsList = page.locator('[data-testid="review-item"]').or(page.locator('.review-item'));
        this.rating = page.locator('[data-testid="rating"]').or(page.locator('[class*="star"]'));

        // Related
        this.relatedProducts = page.locator('[data-testid="related-products"]').or(page.locator('section').filter({ hasText: /related|similar|you may also/i }));

        // Loading
        this.loadingSpinner = page.locator('.animate-spin');
    }

    async goto(productId: string) {
        await this.page.goto(`/product/${productId}`);
        await this.page.waitForLoadState('networkidle');
    }

    async waitForLoaded() {
        await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => { });
        await this.productTitle.waitFor({ state: 'visible', timeout: 10000 });
    }

    async getProductName() {
        return this.productTitle.textContent();
    }

    async getPrice() {
        return this.productPrice.textContent();
    }

    async setQuantity(quantity: number) {
        const currentQty = await this.quantityInput.textContent() || '1';
        const current = parseInt(currentQty);

        for (let i = current; i < quantity; i++) {
            await this.increaseButton.click();
        }
        for (let i = current; i > quantity; i--) {
            await this.decreaseButton.click();
        }
    }

    async addToCart() {
        await this.addToCartButton.click();
    }

    async buyNow() {
        await this.buyNowButton.click();
        await this.page.waitForURL('**/checkout**');
    }

    async selectVariant(index: number) {
        await this.variantOptions.nth(index).click();
    }
}
