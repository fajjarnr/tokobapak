import { Page, Locator } from '@playwright/test';

export class CartPage {
    readonly page: Page;

    // Cart items
    readonly cartItems: Locator;
    readonly emptyCartMessage: Locator;
    readonly loadingSpinner: Locator;

    // Item controls
    readonly quantityInput: Locator;
    readonly increaseButton: Locator;
    readonly decreaseButton: Locator;
    readonly removeButton: Locator;

    // Summary
    readonly subtotal: Locator;
    readonly shippingEstimate: Locator;
    readonly discount: Locator;
    readonly total: Locator;

    // Voucher
    readonly voucherInput: Locator;
    readonly applyVoucherButton: Locator;

    // Actions
    readonly checkoutButton: Locator;
    readonly continueShoppingLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Items
        this.cartItems = page.locator('[data-testid="cart-item"]').or(page.locator('article, .cart-item, [class*="cart"]').filter({ has: page.locator('img') }));
        this.emptyCartMessage = page.locator('h1:has-text("empty"), p:has-text("empty")').or(page.locator(':text("Your cart is empty")'));
        this.loadingSpinner = page.locator('[data-testid="loading"]').or(page.locator('.animate-spin'));

        // Controls
        this.quantityInput = page.locator('input[type="number"]').or(page.locator('span.text-center'));
        this.increaseButton = page.locator('button:has([class*="plus"])').or(page.locator('button').filter({ has: page.locator('svg[class*="plus" i]') }));
        this.decreaseButton = page.locator('button:has([class*="minus"])').or(page.locator('button').filter({ has: page.locator('svg[class*="minus" i]') }));
        this.removeButton = page.locator('button:has([class*="trash"])').or(page.locator('button').filter({ has: page.locator('svg[class*="trash" i]') }));

        // Summary
        this.subtotal = page.locator('text=Subtotal').locator('+ span, ~ span').or(page.locator(':text("Subtotal") + span'));
        this.shippingEstimate = page.locator('text=Shipping').locator('+ span, ~ span');
        this.discount = page.locator('text=Discount').locator('+ span, ~ span');
        this.total = page.locator('.font-bold.text-lg').filter({ hasText: /Rp|IDR/ }).last();

        // Voucher
        this.voucherInput = page.locator('input[placeholder*="oupon" i]').or(page.locator('input[placeholder*="oucher" i]'));
        this.applyVoucherButton = page.locator('button:has-text("Apply")');

        // Actions
        this.checkoutButton = page.locator('a[href="/checkout"]').or(page.locator('button:has-text("Checkout")'));
        this.continueShoppingLink = page.locator('a:has-text("Shopping")').or(page.locator('a[href="/"]'));
    }

    async goto() {
        await this.page.goto('/cart');
        await this.page.waitForLoadState('networkidle');
    }

    async waitForLoaded() {
        // Wait for loading to disappear or for cart items/empty message to appear
        await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => { });
    }

    async getCartItemCount() {
        return this.cartItems.count();
    }

    async getItemByName(name: string) {
        return this.cartItems.filter({ hasText: name });
    }

    async updateItemQuantity(itemIndex: number, increment: boolean) {
        const item = this.cartItems.nth(itemIndex);
        if (increment) {
            await item.locator('button').filter({ has: this.page.locator('svg') }).nth(1).click();
        } else {
            await item.locator('button').filter({ has: this.page.locator('svg') }).first().click();
        }
    }

    async removeItem(itemIndex: number) {
        const item = this.cartItems.nth(itemIndex);
        await item.locator('button.text-destructive, button:has([class*="trash"])').click();
    }

    async applyVoucher(code: string) {
        await this.voucherInput.fill(code);
        await this.applyVoucherButton.click();
    }

    async proceedToCheckout() {
        await this.checkoutButton.click();
        await this.page.waitForURL('**/checkout**');
    }
}
