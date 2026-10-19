-- ===========================================================
-- 広告の数字（媒体側）と月次の振り返り
--   ad_metrics_daily : Meta Marketing API などから日次・広告単位で取り込む
--   monthly_reviews  : 月ごとの「うまくいったこと／いかなかったこと／次の施策」
-- ===========================================================

-- 旧テーブル（未使用）を置き換える
drop table if exists public.ad_spend;

create table if not exists public.ad_metrics_daily (
  id            bigserial primary key,
  date          date not null,
  platform      text not null default 'meta',      -- meta / google / tiktok / line
  account_id    text not null default '',
  campaign_id   text not null default '',
  campaign_name text,
  adset_id      text not null default '',
  adset_name    text,
  ad_id         text not null default '',
  ad_name       text,
  spend         numeric(12,2) not null default 0,  -- 円
  impressions   integer not null default 0,
  reach         integer not null default 0,
  clicks        integer not null default 0,        -- すべてのクリック
  link_clicks   integer not null default 0,        -- リンクのクリック（サイトへ来た数に近い）
  source        text not null default 'meta_api' check (source in ('meta_api','csv','manual')),
  synced_at     timestamptz not null default now(),
  unique (date, platform, campaign_id, adset_id, ad_id)
);
create index if not exists ad_metrics_daily_date_idx on public.ad_metrics_daily (date desc);
create index if not exists ad_metrics_daily_ad_idx   on public.ad_metrics_daily (platform, ad_name);

create table if not exists public.monthly_reviews (
  month        date primary key,                   -- その月の1日
  what_worked  text,
  what_didnt   text,
  actions      jsonb not null default '[]'::jsonb, -- [{title, owner, due, expected}]
  updated_at   timestamptz not null default now()
);
drop trigger if exists monthly_reviews_set_updated_at on public.monthly_reviews;
create trigger monthly_reviews_set_updated_at
  before update on public.monthly_reviews
  for each row execute procedure public.set_updated_at();

-- どちらも service role 専用（ブラウザからは触れない）
alter table public.ad_metrics_daily enable row level security;
alter table public.monthly_reviews  enable row level security;
