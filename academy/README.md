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
| 管理 | `/admin` 流入元ごとのファネル、売上、レッスン完了数、最近のリード・購入 |
| 法務 | `/legal/tokushoho` `/legal/terms` `/legal/privacy`（公開前に確定が必要な箇所は TODO） |

## セットアップ

### 1. Supabase（Sotto とは別に新規プロジェクト）

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

## 運用メモ

- **動画の登録**：Supabase の `lessons.video_url` に Vimeo（非公開・ドメイン制限）や YouTube 限定公開の URL を入れる。動画URLは受講判定の後にサーバー側でだけ取り出すので、ページのソースからは見えない。
- **価格・枠数の変更**：`courses` の `price_*`（販売価格）`list_price_*`（正規価格）`presale_seats_*`（先行枠。0 で無制限）を書き換える。
- **ブレイン経由の購入者**：`enrollments` に `source = 'brain'` で手動追加すれば同じ受講ページが使える。
- **広告費の入力**：`ad_spend` に日次で入れると、管理画面に ROAS が出る。
- **流入元の付け方**：YouTube 概要欄 `?utm_source=youtube&utm_campaign=<動画名>`、Instagram `?utm_source=instagram`、Meta広告は広告マネージャの URL パラメータに `utm_source=meta&utm_campaign={{campaign.name}}`。

## 次に足すもの（優先順）

1. LINE 公式アカウント連携（`leads.line_user_id`）とステップ配信
2. 無料の「強み診断×AI活用相談」チャット（Claude API）→ `leads.segment` に保存
3. Meta Conversions API への購入イベント送信（広告最適化用）
4. 受講者向け AI アシスタント（講座内容を根拠に回答）
5. 法人プランの個別相談予約、課題提出と添削
