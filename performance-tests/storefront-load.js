import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://127.0.0.1:3000';

export const options = {
  scenarios: {
    catalogue_browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 5 },
        { duration: '10s', target: 5 },
        { duration: '5s', target: 0 }
      ],
      gracefulRampDown: '3s'
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99']
  }
};

export default function () {
  const catalogue = http.get(`${baseUrl}/api/products`, {
    tags: { name: 'GET /api/products' }
  });
  check(catalogue, {
    'catalogue returns 200': response => response.status === 200,
    'catalogue includes four products': response => response.json('count') === 4
  });

  const product = http.get(`${baseUrl}/api/products/1`, {
    tags: { name: 'GET /api/products/:id' }
  });
  check(product, {
    'product returns 200': response => response.status === 200,
    'product has expected id': response => response.json('id') === 1
  });

  sleep(0.5);
}
