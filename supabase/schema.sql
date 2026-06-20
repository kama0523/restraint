-- 抑制積立アプリ DBスキーマ
-- Supabase SQL Editorで実行してください。
-- 初回: このファイルを全て実行
-- 追加機能: supabase/migrations/002_extended_settings.sql を実行してください

-- 積立設定(ユーザーごと1行)
create table if not exists settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weekly_amount integer not null default 3000,
  daily_amount integer,
  savings_basis text not null default 'weekly' check (savings_basis in ('weekly', 'daily')),
  updated_at timestamptz not null default now()
);

alter table settings add column if not exists daily_amount integer;
alter table settings add column if not exists savings_basis text not null default 'weekly' check (savings_basis in ('weekly', 'daily'));

-- 日次記録
create table if not exists daily_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  status text not null check (status in ('avoided', 'resisted', 'went')),
  daily_amount integer not null default 0,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- 後悔メモ(daily_records.status = 'went' の記録に1:1で紐づく)
create table if not exists regret_notes (
  id uuid primary key default gen_random_uuid(),
  daily_record_id uuid not null unique references daily_records(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_spent integer not null default 0,
  amount_lost integer not null default 0,
  reason text not null check (reason in ('暇', 'ストレス', '給料日', '誘われた', 'その他')),
  reason_detail text,
  feeling text,
  next_action text,
  free_memo text,
  created_at timestamptz not null default now()
);

create index if not exists daily_records_user_date_idx on daily_records (user_id, date desc);

-- 目標積立額(ユーザーごとに複数設定可)
create table if not exists savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_amount integer not null,
  title text,
  achieved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists savings_goals_user_idx on savings_goals (user_id, target_amount asc);

alter table settings enable row level security;
alter table daily_records enable row level security;
alter table regret_notes enable row level security;

create policy "settings_select_own" on settings for select using (auth.uid() = user_id);
create policy "settings_insert_own" on settings for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on settings for update using (auth.uid() = user_id);

create policy "daily_records_select_own" on daily_records for select using (auth.uid() = user_id);
create policy "daily_records_insert_own" on daily_records for insert with check (auth.uid() = user_id);
create policy "daily_records_update_own" on daily_records for update using (auth.uid() = user_id);
create policy "daily_records_delete_own" on daily_records for delete using (auth.uid() = user_id);

create policy "regret_notes_select_own" on regret_notes for select using (auth.uid() = user_id);
create policy "regret_notes_insert_own" on regret_notes for insert with check (auth.uid() = user_id);
create policy "regret_notes_update_own" on regret_notes for update using (auth.uid() = user_id);
create policy "regret_notes_delete_own" on regret_notes for delete using (auth.uid() = user_id);

alter table savings_goals enable row level security;

create policy "savings_goals_select_own" on savings_goals for select using (auth.uid() = user_id);
create policy "savings_goals_insert_own" on savings_goals for insert with check (auth.uid() = user_id);
create policy "savings_goals_update_own" on savings_goals for update using (auth.uid() = user_id);
create policy "savings_goals_delete_own" on savings_goals for delete using (auth.uid() = user_id);
