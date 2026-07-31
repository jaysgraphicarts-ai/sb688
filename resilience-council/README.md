# SB688 Resilience Council

Production-oriented incident governance and recovery-control application replacing the simulated council screen with authenticated state, role-based access, quorum voting, recovery requests, and a tamper-evident audit chain.

## Real capabilities

- Supabase Auth and PostgreSQL persistence
- Row Level Security by council role
- Incident lifecycle management
- Quorum decision voting
- SHA-256 hash-chained audit events
- Authenticated recovery-action Edge Function
- CI gates for lint, tests, and production build

## Security boundary

This is hardened at the application and database-policy layers. It is not marketed as unhackable. Production still requires MFA, secret rotation, backup drills, monitoring, patching, rate limiting, and external review.

## Setup

Copy `.env.example` to `.env.local`, add the Supabase URL and publishable key, run `npm install`, then `npm run check` and `npm run dev`.
