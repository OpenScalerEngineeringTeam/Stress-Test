import http from 'k6/http';
import { check } from 'k6';
import { fail } from 'k6';

export const options = {
  vus: 5000,
  iterations: 1000000,
};

export default function () {
  const url = 'http://app.alpha.openscaler.net:9213/register';

  const payload = JSON.stringify({
    name: `user_${__VU}_${__ITER}`,
    user_id: `id-${Math.random().toString(36).substring(2, 10)}`,
    session_id: `sess-${__VU}-${__ITER}`,
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  const res = http.post(url, payload, { headers });

  const success = check(res, {
    'is status 200': (r) => r.status === 200,
  });

  // Only log details if the check failed
  if (!success) {
    console.error(`❌ Failed Request:
  VU: ${__VU}, Iteration: ${__ITER}
  Status: ${res.status}
  Body: ${res.body}
  Payload: ${payload}`);
  }
}