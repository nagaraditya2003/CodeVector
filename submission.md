# CodeVector Task Submission

**Live URL:** https://code-vec-sol.onrender.com
**GitHub:** https://github.com/nagaraditya2003/CodeVector

---

## What I built and why
Node.js + Express backend, PostgreSQL on Neon, React frontend. The core decision was keyset pagination over offset — at depth 50,000 my benchmark showed offset taking 1282ms vs keyset taking 157ms. I also used id as a tiebreaker in the sort key so timestamps colliding at scale don't cause skipped rows. Cursors are HMAC-signed so clients can't tamper with them. I ran a concurrency test — 50 inserts mid-pagination, zero duplicates, confirmed keyset is stable under writes.

## What I'd improve with more time
Cursor expiry, rate limiting, and total count estimation without a slow COUNT(*).

## How I used AI
Used Claude throughout. It helped me move fast on boilerplate and the React UI. It got two things wrong — TRUNCATE hanging on Neon and the app.get("*") wildcard breaking on Express v5. I caught and fixed both. I can explain every line of the backend live.

## Benchmark Results
- Offset pagination at depth 50,000: 1282ms
- Keyset pagination at depth 50,000: 157ms
- Speedup: 8.2x faster

## Concurrency Test Result
Pages fetched: 2000
Total unique products seen: 200,000
Result: PASS — Zero duplicates found