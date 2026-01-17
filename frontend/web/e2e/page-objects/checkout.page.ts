import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
    readonly page: Page;

    // Shipping Address
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly addressInput: Locator;
    readonly cityInput: Locator;
    readonly postalCodeInput: Locator;
    readonly phoneInput: Locator;

    // Shipping Method
    readonly standardShipping: Locator;
    readonly expressShipping: Locator;

    // Payment Method
    readonly creditCardOption: Locator;
    readonly bankTransferOption: Locator;
    readonly codOption: Locator;

    // Order Summary
    readonly orderItems: Locator;
    readonly subtotal: Locator;
    readonly shippingCost: Locator;
    readonly total: Locator;

    // Actions
    readonly placeOrderButton: Locator;
    readonly backToCartLink: Locator;

    // Empty state
    readonly emptyMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // Shipping Address - use first() to avoid strict mode violations
        this.firstNameInput = page.locator('#first-name');
        this.lastNameInput = page.locator('#last-name');
        this.addressInput = page.locator('#address');
        this.cityInput = page.locator('#city');
        this.postalCodeInput = page.locator('#zip');
        this.phoneInput = page.locator('#phone');

        // Shipping Method
        this.standardShipping = page.locator('input[value="standard"]').or(page.locator('button[data-state]').filter({ hasText: /standard/i }));
        this.expressShipping = page.locator('input[value="express"]').or(page.locator('button[data-state]').filter({ hasText: /express/i }));

        // Payment Method
        this.creditCardOption = page.locator('#pm1').or(page.locator('button[data-state]').filter({ hasText: /credit card/i }));
        this.bankTransferOption = page.locator('#pm2').or(page.locator('button[data-state]').filter({ hasText: /bank/i }));
        this.codOption = page.locator('#pm3').or(page.locator('button[data-state]').filter({ hasText: /cash on delivery/i }));

        // Order Summary
        this.orderItems = page.locator('[data-testid="order-item"]').or(page.locator('.space-y-3 > div').filter({ has: page.locator('img') }));
        this.subtotal = page.locator('text=Subtotal').locator('+ span, ~ span');
        this.shippingCost = page.locator('text=Shipping').locator('+ span, ~ span');
        this.total = page.locator('.font-bold.text-lg').filter({ hasText: /Rp|IDR/ }).last();

        // Actions
        this.placeOrderButton = page.locator('button:has-text("Place Order")');
        this.backToCartLink = page.locator('a[href="/cart"]');

        // Empty
        this.emptyMessage = page.locator('h1:has-text("empty"), p:has-text("empty")');
    }

    async goto() {
        await this.page.goto('/checkout');
        await this.page.waitForLoadState('networkidle');
    }

    async fillShippingAddress(data: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        postalCode: string;
        phone: string;
    }) {
        await this.firstNameInput.fill(data.firstName);
        await this.lastNameInput.fill(data.lastName);
        await this.addressInput.fill(data.address);
        await this.cityInput.fill(data.city);
        await this.postalCodeInput.fill(data.postalCode);
        await this.phoneInput.fill(data.phone);
    }

    async selectShippingMethod(method: 'standard' | 'express') {
        if (method === 'standard') {
            await this.standardShipping.click();
        } else {
            await this.expressShipping.click();
        }
    }

    async selectPaymentMethod(method: 'card' | 'bank' | 'cod') {
        switch (method) {
            case 'card':
                await this.creditCardOption.click();
                break;
            case 'bank':
                await this.bankTransferOption.click();
                break;
            case 'cod':
                await this.codOption.click();
                break;
        }
    }

    async placeOrder() {
        await this.placeOrderButton.click();
    }

    async waitForOrderSuccess() {
        await this.page.waitForURL('**/order-success**', { timeout: 15000 });
    }
}
