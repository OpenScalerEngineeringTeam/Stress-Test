import http from 'k6/http';
import { check, sleep } from 'k6';

// Options control test load pattern
export const options = {
  stages: [
    { duration: '30s', target: 100 },   // ramp up to 100 VUs
    { duration: '1m',  target: 500 },   // ramp 1k  VUs & hold for 1 minutes
    { duration: '1m',  target: 800 },   // ramp 2k  VUs & hold for 1 minutes
    { duration: '1m',  target: 1200 },  // ramp 4k  VUs & hold for 1 minutes
    { duration: '1m',  target: 1500 },  // ramp 6k  VUs & hold for 1 minutes
    { duration: '1m',  target: 2000 },  // ramp 8k  VUs & hold for 1 minutes
//    { duration: '1m',  target: 3000 },  // ramp 10k VUs & hold for 1 minutes
//    { duration: '1m',  target: 4000 },  // ramp 10k VUs & hold for 1 minutes
//   { duration: '1m',  target: 5000 },  // ramp 10k VUs & hold for 1 minutes
//    { duration: '1m',  target: 6000 },  // ramp 10k VUs & hold for 1 minutes
//    { duration: '1m',  target: 3000 },  // ramp down
//    { duration: '1m',  target: 2000 },  // ramp down
    { duration: '1m',  target: 1000 },  // ramp down
   { duration: '1m',  target: 500 },   // ramp down
    { duration: '30s', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],     // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],       // errors < 1%
  },
};

export default function () {
  // Generate random user data
  const user_id = `U-${__VU}-${Math.floor(Math.random() * 1000000)}`;
  const session_id = `S-${Math.random().toString(36).substring(2, 12)}`;
  const name = `User-${__VU}`;

  const payload = JSON.stringify({
    name,
    user_id,
    session_id,
  });

  const headers = {
    'Content-Type': 'application/json',
    'X-Session-ID': session_id,
  };

  // Send POST request to backend
  const res = http.post('http://app.alpha.openscaler.net:9449/register', payload, { headers });

  // Validate response
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has request_id': (r) => !!r.json('request_id'),
  });

  // Optional: simulate user wait between actions
  sleep(Math.random() * 1.5);
}