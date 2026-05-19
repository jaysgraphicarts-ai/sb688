-- SB688 / JGA OS backend core migration mirror
-- This mirrors the active Supabase backend structure for VS Code and repo organization.
-- No secrets, issued cards, live Memory Chip contents, or client data belong here.

create extension if not exists pgcrypto;

-- Main runtime tables active in Supabase:
-- public.sb688_business_rooms
-- public.sb688_business_members
-- public.sb688_access_passes
-- public.sb688_memory_chips
-- public.sb688_clip_bricks
-- public.sb688_business_clip_bricks
-- public.sb688_stitch_sessions
-- public.sb688_ledger_events
-- public.sb688_business_intake_requests
-- public.sb688_system_activation_log

-- Required enums:
-- public.sb688_access_state:
--   DEMO, PENDING, LEASED_MONTHLY, PAID_OUT, EXPIRED, READ_ONLY, QUARANTINED, DENIED
-- public.sb688_risk_level:
--   LOW, MEDIUM, HIGH, CRITICAL
-- public.sb688_session_state:
--   CARD_PRESENTED, HANDSHAKE_PENDING, LIVE_SESSION, READ_ONLY, DENIED, QUARANTINED, CLOSED

-- Security model:
-- RLS is enabled on all SB688 public-schema tables.
-- Public users may read public catalog/status data and submit safe intake requests.
-- Authenticated business members may read only records tied to their business room.
-- Memory Chip contents, access secrets, private ledgers, and client data must stay protected.

-- Seeded public Clip Bricks:
-- music_brick
-- sales_brick
-- brand_brick
-- content_brick
-- booking_brick
-- support_brick
-- ledger_brick
-- vera_brick

-- Edge Function deployed in Supabase:
-- sb688-stitch-handshake
-- JWT required: true

-- Public status RPC active:
-- public.sb688_public_backend_status()

-- The full applied schema lives in Supabase migrations under project SB - 688.
-- Keep this mirror public-safe and use private migration history for sensitive/runtime changes.
