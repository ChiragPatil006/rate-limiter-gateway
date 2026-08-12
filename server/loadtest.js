const autocannon = require('autocannon');

const API_KEY = 'PASTE_YOUR_ACTUAL_API_KEY_HERE';

const run = async () => {
  const result = await autocannon({
    url: 'http://localhost:5000/gateway/weather',
    connections: 10,       // simulate 10 concurrent users
    duration: 10,          // run for 10 seconds
    headers: {
      'x-api-key': API_KEY,
      'x-algorithm': 'token'
    }
  });

  console.log('--- Load Test Results ---');
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Latency (avg): ${result.latency.average} ms`);
  console.log(`Latency (p99): ${result.latency.p99} ms`);
  console.log(`Total requests: ${result.requests.total}`);
  console.log(`2xx responses: ${result['2xx']}`);
  console.log(`Non-2xx responses (rate limited/errors): ${result.non2xx}`);
};

run();