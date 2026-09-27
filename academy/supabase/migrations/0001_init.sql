-- ===========================================================
-- Stellia Academy — 初期スキーマ
-- Supabase SQL Editor に貼り付けて Run（1回だけ）
--
-- 2系統のテーブル
--   講座系: profiles / courses / lessons / enrollments / lesson_progress / purchases
--   計測系: leads / events / ad_spend
-- ===========================================================

create extension if not exists pgcrypto;

-- ───────────────────────── 共通: updated_at 自動更新 ─────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────── profiles ─────────────────────────
create table if not exists public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text not null default '',
  company      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists profiles_email_idx on public.profiles (lower(email));

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- auth.users が増えたら profiles を自動作成（email も保持）
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, display_name)
  values (new.id, new.email, split_part(coalesce(new.email, ''), '@', 1))
  on conflict (user_id) do update set email = excluded.email;

  -- 決済時に先に作られていた lead があれば本人に紐づける
  update public.leads
     set user_id = new.id, updated_at = now()
   where user_id is null and lower(email) = lower(new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ───────────────────────── courses ─────────────────────────
create table if not exists public.courses (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  title                 text not null,
  subtitle              text,
  description           text,
  -- 現在の販売価格（先行販売中は先行価格を入れる）
  price_personal        integer not null default 0,
  price_business        integer not null default 0,
  -- 正規価格（LPに併記する定価）
  list_price_personal   integer,
  list_price_business   integer,
  -- 先行販売の枠数（0 なら無制限）
  presale_seats_personal integer not null default 0,
  presale_seats_business integer not null default 0,
  is_published          boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
  before update on public.courses
  for each row execute procedure public.set_updated_at();

-- ───────────────────────── lessons ─────────────────────────
create table if not exists public.lessons (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references public.courses(id) on delete cascade,
  slug            text not null,
  title           text not null,
  summary         text,
  -- Vimeo / YouTube の URL、または mp4 の直リンク
  video_url       text,
  duration_min    integer,
  sort_order      integer not null default 0,
  is_free_preview boolean not null default false,
  -- レッスン本文（補足テキスト・チェックリスト等、Markdown）
  body_md         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (course_id, slug)
);
create index if not exists lessons_course_order_idx on public.lessons (course_id, sort_order);
drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute procedure public.set_updated_at();

-- ───────────────────────── enrollments ─────────────────────────
create table if not exists public.enrollments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  plan       text not null check (plan in ('personal','business')),
  source     text not null check (source in ('stripe','brain','manual')),
  status     text not null default 'active' check (status in ('active','revoked')),
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ───────────────────────── lesson_progress ─────────────────────────
create table if not exists public.lesson_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- ───────────────────────── leads（見込み客 + 流入元）─────────────────────────
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  visitor_id    uuid,                       -- 匿名Cookie ID（初回訪問時に発行）
  email         text unique,
  user_id       uuid references auth.users(id) on delete set null,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  gclid         text,
  fbclid        text,
  ttclid        text,
  landing_path  text,
  referrer      text,
  first_seen_at timestamptz,
  line_user_id  text,
  segment       text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists leads_visitor_idx on public.leads (visitor_id);
create index if not exists leads_source_idx  on public.leads (utm_source, utm_campaign);
drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute procedure public.set_updated_at();

-- ───────────────────────── events（行動ログ）─────────────────────────
-- name の例: page_view / lead / checkout_start / purchase / lesson_view / lesson_complete
create table if not exists public.events (
  id         bigserial primary key,
  visitor_id uuid,
  lead_id    uuid references public.leads(id) on delete set null,
  user_id    uuid references auth.users(id) on delete set null,
  name       text not null,
  path       text,
  props      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists events_name_time_idx on public.events (name, created_at desc);
create index if not exists events_visitor_idx   on public.events (visitor_id);

-- ───────────────────────── purchases（決済記録）─────────────────────────
create table if not exists public.purchases (
  id                    uuid primary key default gen_random_uuid(),
  lead_id               uuid references public.leads(id) on delete set null,
  user_id               uuid references auth.users(id) on delete set null,
  course_id             uuid not null references public.courses(id),
  plan                  text not null check (plan in ('personal','business')),
  channel               text not null default 'direct' check (channel in ('direct','brain')),
  amount                integer not null,
  currency              text not null default 'jpy',
  email                 text,
  stripe_session_id     text unique,
  stripe_payment_intent text,
  status                text not null default 'paid' check (status in ('paid','refunded')),
  created_at            timestamptz not null default now()
);
create index if not exists purchases_course_plan_idx on public.purchases (course_id, plan, status);

-- ───────────────────────── ad_spend（広告費・日次）─────────────────────────
create table if not exists public.ad_spend (
  id         bigserial primary key,
  date       date not null,
  platform   text not null,          -- meta / google / tiktok / line
  campaign   text not null default '',
  spend      integer not null default 0,
  created_at timestamptz not null default now(),
  unique (date, platform, campaign)
);

-- ===========================================================
-- RLS（行レベルセキュリティ）
--   計測系・決済系はブラウザから一切触れない（サーバーの service role のみ）
-- ===========================================================
alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.lessons         enable row level security;
alter table public.enrollments     enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.leads           enable row level security;
alter table public.events          enable row level security;
alter table public.purchases       enable row level security;
alter table public.ad_spend        enable row level security;

-- profiles: 本人のみ
drop policy if exists "profiles: read own"   on public.profiles;
create policy "profiles: read own"   on public.profiles for select using (auth.uid() = user_id);
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update using (auth.uid() = user_id);

-- courses / lessons: 公開中のものは誰でもメタ情報を読める
--   ※ 動画URLはサーバー側で受講判定してから返すため、ここでは制限しない
drop policy if exists "courses: public read" on public.courses;
create policy "courses: public read" on public.courses for select using (is_published);
drop policy if exists "lessons: public read" on public.lessons;
create policy "lessons: public read" on public.lessons for select
  using (exists (select 1 from public.courses c where c.id = course_id and c.is_published));

-- enrollments / lesson_progress: 本人のみ
drop policy if exists "enrollments: read own" on public.enrollments;
create policy "enrollments: read own" on public.enrollments for select using (auth.uid() = user_id);
drop policy if exists "progress: read own"   on public.lesson_progress;
create policy "progress: read own"   on public.lesson_progress for select using (auth.uid() = user_id);
drop policy if exists "progress: insert own" on public.lesson_progress;
create policy "progress: insert own" on public.lesson_progress for insert with check (auth.uid() = user_id);
drop policy if exists "progress: delete own" on public.lesson_progress;
create policy "progress: delete own" on public.lesson_progress for delete using (auth.uid() = user_id);

-- leads / events / purchases / ad_spend: ポリシーなし = anon/authenticated は不可、service role のみ

-- ===========================================================
-- 集計ビュー（管理画面用。service role から参照）
-- ===========================================================
create or replace view public.v_funnel_by_source as
select
  coalesce(l.utm_source, e.props->>'utm_source', '(direct)') as source,
  count(*) filter (where e.name = 'page_view')      as page_views,
  count(distinct e.visitor_id) filter (where e.name = 'page_view') as visitors,
  count(*) filter (where e.name = 'lead')           as leads,
  count(*) filter (where e.name = 'checkout_start') as checkouts,
  count(*) filter (where e.name = 'purchase')       as purchases
from public.events e
left join public.leads l on l.id = e.lead_id
group by 1
order by page_views desc;

-- ビューは呼び出し側の権限で評価し、ブラウザ用ロールからは見えなくする（管理画面は service role で参照）
alter view public.v_funnel_by_source set (security_invoker = on);
revoke all on public.v_funnel_by_source from anon, authenticated;

-- トリガー専用関数を REST 経由で呼べないようにする（トリガーからの実行には影響しない）
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
