'use strict';

const state = { products: [], cart: [] };
const productList = document.querySelector('[data-testid="product-list"]');
const cartCount = document.querySelector('[data-testid="cart-count"]');
const categoryFilter = document.querySelector('[data-testid="category-filter"]');
const checkoutForm = document.querySelector('[data-testid="checkout-form"]');
const orderStatus = document.querySelector('[data-testid="order-status"]');

async function loadProducts(category = '') {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const response = await fetch(`/api/products${query}`);
  const data = await response.json();
  state.products = data.items;
  renderProducts();
}

function renderProducts() {
  productList.replaceChildren();
  for (const product of state.products) {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.dataset.testid = 'product-card';
    article.dataset.productId = String(product.id);
    const title = document.createElement('h3');
    title.textContent = product.name;
    const category = document.createElement('p');
    category.textContent = product.category;
    category.className = 'muted';
    const price = document.createElement('p');
    price.textContent = `€${product.price.toFixed(2)}`;
    price.className = 'price';
    const button = document.createElement('button');
    button.textContent = 'Add to cart';
    button.dataset.testid = 'add-to-cart';
    button.addEventListener('click', () => {
      state.cart.push({ productId: product.id, quantity: 1 });
      cartCount.textContent = String(state.cart.length);
    });
    article.append(title, category, price, button);
    productList.append(article);
  }
}

categoryFilter.addEventListener('change', event => loadProducts(event.target.value));

checkoutForm.addEventListener('submit', async event => {
  event.preventDefault();
  orderStatus.textContent = '';
  const email = new FormData(checkoutForm).get('email');
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ customerEmail: email, items: state.cart })
  });
  const data = await response.json();
  if (!response.ok) {
    orderStatus.textContent = data.error;
    return;
  }
  orderStatus.textContent = `Order ${data.id} created`;
  state.cart = [];
  cartCount.textContent = '0';
  checkoutForm.reset();
});

loadProducts();
