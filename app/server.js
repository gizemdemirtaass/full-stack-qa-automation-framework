'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const publicDir = path.join(__dirname, 'public');

const products = [
  { id: 1, name: 'Noise-Cancelling Headphones', category: 'Audio', price: 129.99, stock: 8 },
  { id: 2, name: 'Mechanical Keyboard', category: 'Office', price: 84.5, stock: 12 },
  { id: 3, name: '4K Webcam', category: 'Office', price: 99.0, stock: 5 },
  { id: 4, name: 'Portable Speaker', category: 'Audio', price: 59.9, stock: 15 }
];
const orders = new Map();

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error('Payload too large'));
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    request.on('error', reject);
  });
}

function serveStatic(response, fileName, contentType) {
  fs.readFile(path.join(publicDir, fileName), (error, data) => {
    if (error) return sendJson(response, 404, { error: 'Not found' });
    response.writeHead(200, {
      'content-type': contentType,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'"
    });
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    return sendJson(response, 200, { status: 'UP', service: 'portfolio-storefront' });
  }
  if (request.method === 'GET' && url.pathname === '/api/products') {
    const category = url.searchParams.get('category');
    const result = category ? products.filter(p => p.category === category) : products;
    return sendJson(response, 200, { items: result, count: result.length });
  }
  if (request.method === 'GET' && /^\/api\/products\/\d+$/.test(url.pathname)) {
    const product = products.find(p => p.id === Number(url.pathname.split('/').pop()));
    return product
      ? sendJson(response, 200, product)
      : sendJson(response, 404, { error: 'Product not found' });
  }
  if (request.method === 'POST' && url.pathname === '/api/orders') {
    try {
      const body = await readBody(request);
      if (!body.customerEmail || !Array.isArray(body.items) || body.items.length === 0) {
        return sendJson(response, 400, { error: 'customerEmail and at least one item are required' });
      }
      const unknown = body.items.find(item => !products.some(product => product.id === item.productId));
      if (unknown) return sendJson(response, 422, { error: `Unknown product: ${unknown.productId}` });
      const order = {
        id: crypto.randomUUID(),
        customerEmail: body.customerEmail,
        items: body.items,
        status: 'CREATED',
        createdAt: new Date().toISOString()
      };
      orders.set(order.id, order);
      return sendJson(response, 201, order);
    } catch (error) {
      return sendJson(response, 400, { error: error.message });
    }
  }
  if (request.method === 'GET' && url.pathname.startsWith('/api/orders/')) {
    const order = orders.get(url.pathname.split('/').pop());
    return order
      ? sendJson(response, 200, order)
      : sendJson(response, 404, { error: 'Order not found' });
  }
  if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    return serveStatic(response, 'index.html', 'text/html; charset=utf-8');
  }
  if (request.method === 'GET' && url.pathname === '/app.js') {
    return serveStatic(response, 'app.js', 'application/javascript; charset=utf-8');
  }
  if (request.method === 'GET' && url.pathname === '/styles.css') {
    return serveStatic(response, 'styles.css', 'text/css; charset=utf-8');
  }
  return sendJson(response, 404, { error: 'Not found' });
});

server.listen(port, host, () => {
  console.log(`Portfolio Storefront listening on http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
