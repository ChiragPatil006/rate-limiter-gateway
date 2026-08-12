# Load Test Results

Tested using `autocannon` — 10 concurrent connections, 10 second duration.

## Through the full gateway (auth + rate limiting + logging)
- Requests/sec: 50.9
- Avg latency: 181.61 ms
- p99 latency: 863 ms
- Total requests: 509
- Allowed (2xx): 5
- Rate limited (429): 504

## Raw dummy service (no auth, no rate limiting, no logging)
- Requests/sec: 3615.4
- Avg latency: 2.24 ms
- p99 latency: 14 ms
- Total requests: 36151
- Success: 36151 (100%)

## Interpretation
The gateway adds real overhead (~70x throughput reduction) because each request performs three I/O operations: an API key lookup (MongoDB), an atomic rate limit check (Redis), and a request log write (MongoDB) — in addition to forwarding the request to the backend service. This is the measurable cost of adding authentication, distributed rate limiting, and audit logging to an API. Under sustained load far exceeding the configured limit (5 requests/minute), the rate limiter correctly rejected 99% of traffic (504/509 requests), confirming it holds under real concurrent pressure, not just casual testing.