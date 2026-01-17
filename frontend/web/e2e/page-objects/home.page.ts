import { Page, Locator } from '@playwright/test';

export class HomePage {
    readonly page: Page;

    // Hero Section
    readonly heroCarousel: Locator;
    readonly heroSlides: Locator;

    // Navigation
    readonly header: Locator;
    readonly logo: Locator;
    readonly searchInput: Locator;
    readonly cartButton: Locator;
    readonly userMenu: Locator;

    // Sections
    readonly trustBadges: Locator;
    readonly categoriesGrid: Locator;
    readonly flashSaleSection: Locator;
    readonly trendingProducts: Locator;
    readonly featuredProducts: Locator;
    readonly promoBanner: Locator;
    readonly newsletterSection: Locator;
    readonly footer: Locator;

    constructor(page: Page) {
        this.page = page;

        // Hero
        this.heroCarousel = page.locator('[data-testid="hero-carousel"]').or(page.locator('.embla'));
        this.heroSlides = page.locator('[data-testid="hero-slide"]').or(page.locator('.embla__slide'));

        // Navigation
        this.header = page.locator('header');
        this.logo = page.locator('a[href="/"]').filter({ hasText: /tokobapak/i }).or(page.locator('header a[href="/"]').first());
        this.searchInput = page.locator('input[placeholder*="Search"]').or(page.locator('input[type="search"]'));
        this.cartButton = page.locator('[data-testid="cart-button"]').or(page.locator('a[href="/cart"]'));
        this.userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('button:has-text("Account")'));

        // Sections
        this.trustBadges = page.locator('[data-testid="trust-badges"]').or(page.locator('section').filter({ hasText: /free shipping|secure|support/i }).first());
        this.categoriesGrid = page.locator('[data-testid="categories-grid"]').or(page.locator('section').filter({ hasText: /categories/i }).first());
        this.flashSaleSection = page.locator('[data-testid="flash-sale"]').or(page.locator('section').filter({ hasText: /flash sale/i }).first());
        this.trendingProducts = page.locator('[data-testid="trending-products"]').or(page.locator('section').filter({ hasText: /trending/i }).first());
        this.featuredProducts = page.locator('[data-testid="featured-products"]').or(page.locator('section').filter({ hasText: /featured/i }).first());
        this.promoBanner = page.locator('[data-testid="promo-banner"]').or(page.locator('section').filter({ hasText: /sale|discount|off/i }).first());
        this.newsletterSection = page.locator('[data-testid="newsletter"]').or(page.locator('section').filter({ hasText: /newsletter|subscribe/i }).first());
        this.footer = page.locator('footer');
    }

    async goto() {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
    }

    async getProductCards() {
        return this.page.locator('[data-testid="product-card"]').or(this.page.locator('article, .product-card, [class*="product"]').filter({ has: this.page.locator('img') }));
    }

    async getCategoryCards() {
        return this.categoriesGrid.locator('a, button').filter({ has: this.page.locator('img').or(this.page.locator('svg')) });
    }

    async clickFirstProduct() {
        const productCards = await this.getProductCards();
        await productCards.first().click();
    }

    async searchProduct(query: string) {
        await this.searchInput.fill(query);
        await this.searchInput.press('Enter');
    }
}
