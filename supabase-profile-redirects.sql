create table if not exists public.profile_redirects (
  id uuid primary key default gen_random_uuid(),
  source_username text not null unique,
  target_username text not null,
  target_user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint profile_redirects_source_format check (source_username ~ '^[a-z0-9_-]{3,30}$'),
  constraint profile_redirects_target_format check (target_username ~ '^[a-z0-9_-]{3,30}$'),
  constraint profile_redirects_not_self check (source_username <> target_username)
);

create index if not exists profile_redirects_target_user_id_idx
  on public.profile_redirects(target_user_id);

alter table public.profile_redirects enable row level security;
