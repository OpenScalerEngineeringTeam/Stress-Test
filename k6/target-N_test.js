import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 5000, // number of virtual users
  iterations: 100000, // total number of requests
};

export default function () {
 // const url = 'http://app.alpha.openscaler.net:9213/register';
//  const url = 'http://app.alpha.openscaler.net:9346/register';
  const url = 'http://app.alpha.openscaler.net:9449/register';
  const payload = JSON.stringify({
    name: `user_${__VU}_${__ITER}`,         // unique name per iteration
    user_id: `id-${Math.random().toString(36).substring(2, 10)}`,
    session_id: `sess-${__VU}-${__ITER}`,   // unique session ID
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  const res = http.post(url, payload, { headers });

  check(res, {
    'is status 200': (r) => r.status === 200,
  });
}