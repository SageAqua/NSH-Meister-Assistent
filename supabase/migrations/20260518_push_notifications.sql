-- Push subscription storage (one row per device per user)
create table if not exists push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  endpoint      text not null unique,
  subscription  jsonb not null,
  notify_1day   boolean not null default true,
  notify_1hour  boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on push_subscriptions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Deduplication log: tracks which (event, type) combos already notified
create table if not exists notification_log (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid references calendar_events(id) on delete cascade not null,
  notification_type text not null,
  sent_at           timestamptz not null default now(),
  unique (event_id, notification_type)
);
-- No RLS — only the service-role cron writes here
