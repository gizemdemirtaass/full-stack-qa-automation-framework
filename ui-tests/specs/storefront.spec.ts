import { expect, test } from '@playwright/test';
import { StorefrontPage } from '../pages/StorefrontPage';

test.describe('Storefront shopping journey', () => {
  test('filters products by category', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.open();

    await storefront.filterByCategory('Audio');

    await expect(storefront.productCards).toHaveCount(2);
    await expect(storefront.productCards).toContainText([
      'Noise-Cancelling Headphones',
      'Portable Speaker'
    ]);
  });

  test('adds a product and completes checkout', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.open();

    await storefront.addProductToCart('Mechanical Keyboard');
    await expect(storefront.cartCount).toHaveText('1');

    await storefront.checkout('gizem.qa@example.com');

    await expect(storefront.orderStatus).toContainText(/^Order .* created$/);
    await expect(storefront.cartCount).toHaveText('0');
  });

  test('shows validation when checkout cart is empty', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.open();

    await storefront.checkout('gizem.qa@example.com');

    await expect(storefront.orderStatus).toHaveText('customerEmail and at least one item are required');
  });
});
