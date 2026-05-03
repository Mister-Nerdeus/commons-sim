create table if not exists identities (
  identity_id text primary key,
  identity_secret text not null,
  secret_hash text not null,
  created_at_utc timestamptz not null,
  label text not null,
  disabled boolean not null default false
);

create table if not exists seasons (
  season_id text primary key,
  title text not null,
  benchmark_ids jsonb not null default '[]'::jsonb,
  starts_at_utc timestamptz not null,
  ends_at_utc timestamptz,
  active boolean not null default true
);

create table if not exists leaderboard_entries (
  season_id text not null references seasons(season_id) on delete restrict,
  benchmark_id text not null,
  submission_id text not null,
  identity_id text not null,
  submitted_at_utc timestamptz not null,
  result jsonb not null,
  review_status text not null check (review_status in ('pending', 'finalist', 'approved', 'rejected')),
  review_note text not null default '',
  review_updated_at_utc timestamptz,
  primary key (season_id, benchmark_id, submission_id)
);

create table if not exists audit_events (
  id bigserial primary key,
  created_at_utc timestamptz not null default now(),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists leaderboard_entries_benchmark_score_idx
  on leaderboard_entries (benchmark_id, season_id, ((result->>'totalScore')::numeric) desc);

create index if not exists leaderboard_entries_review_status_idx
  on leaderboard_entries (review_status, submitted_at_utc desc);

create index if not exists seasons_active_window_idx
  on seasons (active, starts_at_utc, ends_at_utc);
