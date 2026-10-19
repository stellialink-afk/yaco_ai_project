# Stellia Academy

「AIで自社の動画広告を内製する講座」を **自社サイトで販売・受講・効果測定** するためのプラットフォーム。
Sotto（`../src`）とは別プロジェクト。Sotto と同じスタック（Next.js 16 / Supabase / Vercel）で、認証まわりを流用している。

## できること（土台 v0.1）

| 領域 | 実装 |
|---|---|
| LP | `/` 先行販売LP。文面は `src/content/lp.ts`、価格・残席は DB から |
| 流入元の記録 | URL の `utm_*` / `gclid` / `fbclid` / `ttclid` を初回タッチで Cookie に保存し、登録・購入時に `leads` へ紐づけ |
| 行動ログ | `events` テーブルに page_view / lead / checkout_start / purchase / lesson_view / lesson_complete |
| 認証 | メールの認証コード（パスワードなし）。`/signin` |
| 決済 | Stripe Checkout（個人 / 法人）。Webhook で購入記録 → ユーザー作成 → 受講権限付与 |
| 受講 | `/learn` 講座一覧、`/learn/[course]/[lesson]` 動画（Vimeo / YouTube / mp4）＋完了ボタン |
| 管理 | `/admin` 広告と売上のダッシュボード：主要指標（ROAS / CPA / CVR / CTR / LTV）、媒体別、週次推移、ファネル、クリエイティブ別、月次の振り返り、用語解説 |
| 広告データ | `ad_metrics_daily` に日次・広告単位で取り込み。Meta は Marketing API を毎日自動同期（Vercel Cron）、Google は Google 広告スクリプトから `/api/ads/ingest` へ送信。手順は `/admin/setup` に日本語で表示 |
| 法務 | `/legal/tokushoho` `/legal/terms` `/legal/privacy`（公開前に確定が必要な箇所は TODO） |

## セットアップ

### 1. Supabase（Sotto とは別に新規プロジェクト）

本番プロジェクト `stellia-academy`（ref: `fmhtroizdqsavgzqlkyh`、Tokyo）は作成済みで、
`0001_init.sql` と `seed.sql` は 2026-09-27 に適用済み。別環境を作るときだけ以下を実行する。

1. https://supabase.com でプロジェクト作成（リージョンは Tokyo）
2. SQL Editor で `supabase/migrations/0001_init.sql` を実行
3. 続けて `supabase/seed.sql` を実行（講座と8レッスンの下書きが入る）
4. Authentication → Providers → Email：**Confirm email を ON、OTP（認証コード）を有効化**。メールテンプレートに `{{ .Token }}` を含める
5. Authentication → URL Configuration：Site URL と Redirect URLs に本番ドメインと `http://localhost:3000` を追加

### 2. Stripe

1. ダッシュボードで API キー（`sk_test_...`）を取得
2. Webhook を追加：エンドポイント `https://<ドメイン>/api/stripe/webhook`、イベント `checkout.session.completed`。署名シークレット（`whsec_...`）を控える
3. ローカル確認は `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### 3. 環境変数

`.env.example` を `.env.local` にコピーして埋める。Vercel にも同じ値を設定する。

### 4. 起動

```bash
cd academy
npm install
npm run dev
```

### 5. Vercel

このリポジトリを Import し、**Root Directory を `academy`** に設定する。
（将来 `academy/` を独立リポジトリに移す場合は `git subtree split -P academy -b academy-only` で履歴ごと切り出せる）

### 6. 広告データの接続（任意・あとからでOK）

`/admin/setup` に画面付きの手順がある。要点だけ:

- **Meta**: システムユーザーの無期限トークン（権限 `ads_read`, `read_insights`）と広告アカウントIDを `META_ACCESS_TOKEN` / `META_AD_ACCOUNT_ID` に設定。`CRON_SECRET` を入れると `vercel.json` の Cron が毎日 21:00 UTC（日本時間 6:00）に過去7日分を上書き同期する。手動は `/admin` の「Metaから今すぐ取り込む」。
- **Google**: `ADS_INGEST_SECRET` を設定し、`scripts/google-ads-script.js` を Google 広告の「スクリプト」に貼って毎日実行。開発者トークン不要。
- **広告URLのパラメーター**: Meta は `utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`、Google はトラッキングテンプレートに `{lpurl}?utm_source=google&utm_medium=paid&utm_campaign={campaignid}&utm_content={creative}`。`utm_content` が広告名と一致すると「どの広告から買われたか」がつながる。

## 運用メモ

- **動画の登録**：Supabase の `lessons.video_url` に Vimeo（非公開・ドメイン制限）や YouTube 限定公開の URL を入れる。動画URLは受講判定の後にサーバー側でだけ取り出すので、ページのソースからは見えない。
- **価格・枠数の変更**：`courses` の `price_*`（販売価格）`list_price_*`（正規価格）`presale_seats_*`（先行枠。0 で無制限）を書き換える。
- **ブレイン経由の購入者**：`enrollments` に `source = 'brain'` で手動追加すれば同じ受講ページが使える。
- **広告費の手入力**：媒体連携前でも `ad_metrics_daily` に `date / platform / spend / impressions / clicks` を入れれば ROAS・CPA が出る（`source = 'manual'`）。
- **流入元の付け方**：YouTube 概要欄 `?utm_source=youtube&utm_campaign=<動画名>`、Instagram `?utm_source=instagram`、Meta広告は広告マネージャの URL パラメータに `utm_source=meta&utm_campaign={{campaign.name}}`。

## 次に足すもの（優先順）

1. 月次レポートの自動生成（`/admin` と同じ集計から PDF / スライドを出力）
2. LINE 公式アカウント連携（`leads.line_user_id`）とステップ配信
3. Meta Conversions API への購入イベント送信（広告最適化用）
4. 無料の「強み診断×AI活用相談」チャット（Claude API）→ `leads.segment` に保存
5. 受講者向け AI アシスタント（講座内容を根拠に回答）
6. 法人プランの個別相談予約、課題提出と添削
