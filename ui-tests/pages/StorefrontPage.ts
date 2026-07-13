import { expect, type Locator, type Page } from '@playwright/test';

export class StorefrontPage {
  readonly page: Page;
  readonly productCards: Locator;
  readonly categoryFilter: Locator;
  readonly cartCount: Locator;
  readonly emailInput: Locator;
  readonly placeOrderButton: Locator;
  readonly orderStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCards = page.getByTestId('product-card');
    this.categoryFilter = page.getByTestId('category-filter');
    this.cartCount = page.getByTestId('cart-count');
    this.emailInput = page.getByTestId('email');
    this.placeOrderButton = page.getByRole('button', { name: 'Place order' });
    this.orderStatus = page.getByTestId('order-status');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page).toHaveTitle('Quality Market');
    await expect(this.productCards).toHaveCount(4);
  }

  async filterByCategory(category: 'Audio' | 'Office'): Promise<void> {
    await this.categoryFilter.selectOption(category);
  }

  async addProductToCart(productName: string): Promise<void> {
    const card = this.productCards.filter({ hasText: productName });
    await expect(card).toHaveCount(1);
    await card.getByTestId('add-to-cart').click();
  }

  async checkout(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.placeOrderButton.click();
  }
}
