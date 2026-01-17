import { Page, Locator } from '@playwright/test';

export class LoginPage {
    readonly page: Page;

    // Form elements
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly rememberMeCheckbox: Locator;
    readonly submitButton: Locator;
    readonly forgotPasswordLink: Locator;
    readonly registerLink: Locator;

    // Social login
    readonly googleButton: Locator;
    readonly facebookButton: Locator;

    // Card/Container
    readonly loginCard: Locator;
    readonly cardTitle: Locator;

    // Messages
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // Form
        this.emailInput = page.locator('input[name="email"]').or(page.locator('input[type="email"]')).or(page.locator('input[placeholder*="email" i]'));
        this.passwordInput = page.locator('input[name="password"]').or(page.locator('input[type="password"]'));
        this.rememberMeCheckbox = page.locator('[data-testid="remember-me-checkbox"]').or(page.locator('button[role="checkbox"]'));
        this.submitButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Sign In")'));
        this.forgotPasswordLink = page.locator('a[href*="forgot"]').or(page.locator('a:has-text("Forgot password")'));
        this.registerLink = page.locator('a[href*="register"]').or(page.locator('a:has-text("Sign up")'));

        // Social
        this.googleButton = page.locator('button:has-text("Google")');
        this.facebookButton = page.locator('button:has-text("Facebook")');

        // Container
        this.loginCard = page.locator('[data-testid="login-card"]').or(page.locator('form').first().locator('..'));
        this.cardTitle = page.locator('[data-testid="login-title"]').or(page.locator('h1, h2').filter({ hasText: /login|sign in/i }));

        // Error
        this.errorMessage = page.locator('[data-testid="error-message"]').or(page.locator('[role="alert"]')).or(page.locator('.text-destructive, .text-red-500'));
    }

    async goto() {
        await this.page.goto('/login');
        await this.page.waitForLoadState('networkidle');
    }

    async login(email: string, password: string, rememberMe: boolean = false) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);

        if (rememberMe) {
            await this.rememberMeCheckbox.click();
        }

        await this.submitButton.click();
    }

    async waitForLoginSuccess() {
        // After successful login, should redirect to home page
        await this.page.waitForURL('/', { timeout: 10000 });
    }

    async getValidationError() {
        return this.page.locator('[data-message]').or(this.page.locator('p.text-destructive')).or(this.page.locator('[role="alert"] p'));
    }
}
