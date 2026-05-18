create extension if not exists pgcrypto;

create table if not exists public.work_room_items (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  room text not null,
  title text not null,
  item_type text not null,
  status text not null default 'captured',
  source_platform text,
  language text default 'en',
  risk_level text default 'low',
  proof_status text default 'designed_not_runtime_proven',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_room_files (
  id uuid primary key default gen_random_uuid(),
  work_room_item_id uuid references public.work_room_items(id) on delete set null,
  owner_email text not null,
  file_name text not null,
  file_type text,
  storage_path text,
  sha256 text,
  review_status text not null default 'needs_review',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  business_brick text not null,
  campaign_name text not null,
  objective text,
  audience text,
  platform text,
  approval_status text not null default 'draft',
  compliance_status text not null default 'needs_scan',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.ad_campaigns(id) on delete cascade,
  ad_type text not null,
  title text,
  draft_text text,
  prompt_used text,
  media_path text,
  video_script text,
  storyboard text,
  call_to_action text,
  approval_status text not null default 'draft',
  publish_status text not null default 'not_scheduled',
  scheduled_at timestamptz,
  published_at timestamptz,
  sent_at timestamptz,
  ledger jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_sync_tasks (
  id uuid primary key default gen_random_uuid(),
  feature_name text not null,
  github_status text not null default 'planned',
  docker_status text not null default 'review_needed',
  vscode_status text not null default 'review_needed',
  supabase_status text not null default 'review_needed',
  runtime_test_status text not null default 'needed',
  tie_off_status text not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.work_room_items enable row level security;
alter table public.work_room_files enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.ad_assets enable row level security;
alter table public.platform_sync_tasks enable row level security;
