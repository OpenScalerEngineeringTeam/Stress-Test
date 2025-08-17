import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10, // number of concurrent virtual users
  duration: '30s', // test duration
};

export default function () {
  const url = 'http://localhost:3000/register';

  // Generate fake Algerian-style data
  const payload = JSON.stringify({
    name: `Test User ${__VU}-${__ITER}`,
    nin: '123456789012345678',   // valid 18-digit
    nss: '123456789012345',      // valid 15-digit
    phone: '0551234567',         // valid Algerian phone
    wilaya: '16',                // valid wilaya
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let res = http.post(url, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has request_id': (r) => JSON.parse(r.body).request_id !== undefined,
  });

  sleep(1); // simulate wait between requests
}
